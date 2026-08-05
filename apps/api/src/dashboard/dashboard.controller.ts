import {
  BadRequestException,
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { JwtUser } from "../auth/jwt-user.interface";
import { PrismaService } from "../prisma/prisma.service";

import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Recupera l'associazione attiva.
   *
   * Se associationId non è presente nel vecchio JWT,
   * usa automaticamente la prima membership dell'utente.
   */
  private async resolveAssociationId(
    user: JwtUser,
  ): Promise<string> {
    if (user.associationId) {
      return user.associationId;
    }

    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          associationId: true,
        },
      });

    if (!membership?.associationId) {
      throw new BadRequestException(
        "Nessuna associazione collegata all'utente",
      );
    }

    return membership.associationId;
  }

  /**
   * KPI principali
   *
   * GET /api/dashboard/kpis
   */
  @Get("kpis")
  async getKpis(
    @CurrentUser() user: JwtUser,
  ) {
    const associationId =
      await this.resolveAssociationId(user);

    return this.dashboard.getKpis(
      associationId,
      user.id,
    );
  }

  /**
   * Trend finanziario
   *
   * GET /api/dashboard/finance-trend
   */
  @Get("finance-trend")
  async financeTrend(
    @CurrentUser() user: JwtUser,
  ) {
    const associationId =
      await this.resolveAssociationId(user);

    return this.dashboard.getFinanceTrend(
      associationId,
      user.id,
    );
  }

  /**
   * Trend eventi
   *
   * GET /api/dashboard/events-trend
   */
  @Get("events-trend")
  async eventsTrend(
    @CurrentUser() user: JwtUser,
  ) {
    const associationId =
      await this.resolveAssociationId(user);

    return this.dashboard.getEventsTrend(
      associationId,
      user.id,
    );
  }

  /**
   * Ultime transazioni
   *
   * GET /api/dashboard/latest-transactions
   */
  @Get("latest-transactions")
  async latestTransactions(
    @CurrentUser() user: JwtUser,
  ) {
    const associationId =
      await this.resolveAssociationId(user);

    return this.dashboard.latestTransactions(
      associationId,
      user.id,
    );
  }

  /**
   * Ultimi eventi
   *
   * GET /api/dashboard/latest-events
   */
  @Get("latest-events")
  async latestEvents(
    @CurrentUser() user: JwtUser,
  ) {
    const associationId =
      await this.resolveAssociationId(user);

    return this.dashboard.latestEvents(
      associationId,
      user.id,
    );
  }
}