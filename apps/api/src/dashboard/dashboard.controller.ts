import {
  BadRequestException,
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { CurrentUser } from "../auth/current-user.decorator";
import type { JwtUser } from "../auth/jwt-user.interface";
import { PrismaService } from "../prisma/prisma.service";
import { DashboardService } from "./dashboard.service";

@UseGuards(AuthGuard("jwt"))
@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly prisma: PrismaService,
  ) {}

  private async resolveUserId(
    user: JwtUser,
  ): Promise<string> {
    const payload = user as unknown as Record<
      string,
      unknown
    >;

    const nestedUser =
      typeof payload.user === "object" &&
      payload.user !== null
        ? (payload.user as Record<string, unknown>)
        : undefined;

    const directUserId =
      payload.id ??
      payload.sub ??
      payload.userId ??
      nestedUser?.id ??
      nestedUser?.userId;

    if (
      typeof directUserId === "string" &&
      directUserId.trim()
    ) {
      return directUserId;
    }

    const possibleEmail =
      payload.email ??
      payload.username ??
      nestedUser?.email;

    if (
      typeof possibleEmail === "string" &&
      possibleEmail.trim()
    ) {
      const databaseUser =
        await this.prisma.user.findFirst({
          where: {
            email: possibleEmail.trim(),
          },
          select: {
            id: true,
          },
        });

      if (databaseUser) {
        return databaseUser.id;
      }
    }

    throw new BadRequestException(
      "Impossibile identificare l'utente autenticato",
    );
  }

  private async resolveAssociationId(
    user: JwtUser,
    userId: string,
  ): Promise<string> {
    const payload = user as unknown as Record<
      string,
      unknown
    >;

    const nestedUser =
      typeof payload.user === "object" &&
      payload.user !== null
        ? (payload.user as Record<string, unknown>)
        : undefined;

    const tokenAssociationId =
      payload.associationId ??
      payload.currentAssociationId ??
      nestedUser?.associationId ??
      nestedUser?.currentAssociationId;

    if (
      typeof tokenAssociationId === "string" &&
      tokenAssociationId.trim()
    ) {
      const selectedMembership =
        await this.prisma.membership.findFirst({
          where: {
            userId,
            associationId: tokenAssociationId,
          },
          select: {
            associationId: true,
          },
        });

      if (selectedMembership) {
        return selectedMembership.associationId;
      }
    }

    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          associationId: true,
        },
      });

    if (!membership) {
      throw new BadRequestException(
        "Nessuna associazione collegata all'utente",
      );
    }

    return membership.associationId;
  }

  private async resolveContext(user: JwtUser) {
    const userId = await this.resolveUserId(user);

    const associationId =
      await this.resolveAssociationId(
        user,
        userId,
      );

    return {
      userId,
      associationId,
    };
  }

  @Get("kpis")
  async getKpis(
    @CurrentUser() user: JwtUser,
  ) {
    const { userId, associationId } =
      await this.resolveContext(user);

    return this.dashboard.getKpis(
      associationId,
      userId,
    );
  }

  @Get("finance-trend")
  async financeTrend(
    @CurrentUser() user: JwtUser,
  ) {
    const { userId, associationId } =
      await this.resolveContext(user);

    return this.dashboard.getFinanceTrend(
      associationId,
      userId,
    );
  }

  @Get("events-trend")
  async eventsTrend(
    @CurrentUser() user: JwtUser,
  ) {
    const { userId, associationId } =
      await this.resolveContext(user);

    return this.dashboard.getEventsTrend(
      associationId,
      userId,
    );
  }

  @Get("latest-transactions")
  async latestTransactions(
    @CurrentUser() user: JwtUser,
  ) {
    const { userId, associationId } =
      await this.resolveContext(user);

    return this.dashboard.latestTransactions(
      associationId,
      userId,
    );
  }

  @Get("latest-events")
  async latestEvents(
    @CurrentUser() user: JwtUser,
  ) {
    const { userId, associationId } =
      await this.resolveContext(user);

    return this.dashboard.latestEvents(
      associationId,
      userId,
    );
  }

  @Get("recent-activity")
  async recentActivity(
    @CurrentUser() user: JwtUser,
  ) {
    const { userId, associationId } =
      await this.resolveContext(user);

    return this.dashboard.recentActivity(
      associationId,
      userId,
    );
  }
}