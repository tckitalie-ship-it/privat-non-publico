import {
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { CurrentUser } from "../../auth/current-user.decorator";

@Controller("api/search")
export class SearchController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get("transactions")
  async searchTransactions(
    @CurrentUser() user: any,
    @Query("q") query: string
  ) {
    if (!query || query.trim() === "") {
      return [];
    }

    const memberships = await this.prisma.membership.findMany({
      where: { userId: user.sub },
      select: { associationId: true },
    });

    const associationIds = memberships.map((m) => m.associationId);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        AND: [
          {
            associationId: {
              in: associationIds,
            },
          },
          {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      orderBy: { date: "desc" },
      take: 50,
    });

    return transactions;
  }
}
