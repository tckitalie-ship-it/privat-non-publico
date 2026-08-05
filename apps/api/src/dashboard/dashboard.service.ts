import { Injectable, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifica che l’utente appartenga all’associazione
   */
  private async ensureMembership(userId: string, associationId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, associationId },
    });

    if (!membership) {
      throw new ForbiddenException("Non sei membro di questa associazione");
    }
  }

  /**
   * KPI principali per la dashboard
   */
  async getKpis(associationId: string, userId: string) {
    await this.ensureMembership(userId, associationId);

    const now = new Date();

    const [totalMembers, pendingInvitations, activeEvents, transactions] =
      await Promise.all([
        this.prisma.membership.count({
          where: {
            associationId,
          },
        }),

        this.prisma.invitation.count({
          where: {
            associationId,
            acceptedAt: null,
          },
        }),

        this.prisma.event.count({
          where: {
            associationId,
            startsAt: {
              gte: now,
            },
          },
        }),

        this.prisma.transaction.findMany({
          where: {
            associationId,
          },
          select: {
            type: true,
            amountCents: true,
          },
        }),
      ]);

    const monthlyIncome = transactions
      .filter((transaction) => transaction.type === "INCOME")
      .reduce((total, transaction) => total + transaction.amountCents, 0);

    const monthlyExpenses = transactions
      .filter((transaction) => transaction.type === "EXPENSE")
      .reduce((total, transaction) => total + transaction.amountCents, 0);

    return {
      totalMembers,
      pendingInvitations,
      monthlyIncome,
      monthlyExpenses,
      activeEvents,
    };
  }

  /**
   * Trend finanziario mensile
   */
  async getFinanceTrend(associationId: string, userId: string) {
    await this.ensureMembership(userId, associationId);

    const transactions = await this.prisma.transaction.findMany({
      where: { associationId },
      orderBy: { date: "asc" },
    });

    const trend: Record<string, { income: number; expense: number }> = {};

    for (const t of transactions) {
      const key = `${t.date.getFullYear()}-${String(
        t.date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!trend[key]) {
        trend[key] = { income: 0, expense: 0 };
      }

      if (t.type === "INCOME") trend[key].income += t.amountCents;
      else trend[key].expense += t.amountCents;
    }

    return Object.entries(trend).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    }));
  }

  /**
   * Trend eventi mensile
   */
  async getEventsTrend(associationId: string, userId: string) {
    await this.ensureMembership(userId, associationId);

    const events = await this.prisma.event.findMany({
      where: { associationId },
      orderBy: { startsAt: "asc" },
    });

    const trend: Record<string, number> = {};

    for (const e of events) {
      const key = `${e.startsAt.getFullYear()}-${String(
        e.startsAt.getMonth() + 1
      ).padStart(2, "0")}`;

      trend[key] = (trend[key] ?? 0) + 1;
    }

    return Object.entries(trend).map(([month, count]) => ({
      month,
      count,
    }));
  }

  /**
   * Ultime transazioni
   */
  async latestTransactions(associationId: string, userId: string) {
    await this.ensureMembership(userId, associationId);

    return this.prisma.transaction.findMany({
      where: { associationId },
      orderBy: { date: "desc" },
      take: 10,
    });
  }

  /**
   * Ultimi eventi
   */
  async latestEvents(associationId: string, userId: string) {
    await this.ensureMembership(userId, associationId);

    return this.prisma.event.findMany({
      where: { associationId },
      orderBy: { startsAt: "desc" },
      take: 10,
    });
  }
}

