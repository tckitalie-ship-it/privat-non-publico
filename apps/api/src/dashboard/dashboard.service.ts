import { Injectable, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifica che lâ€™utente appartenga allâ€™associazione
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
  async getMembersTrend(
    associationId: string,
    userId: string,
  ) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        associationId,
      },
      select: {
        id: true,
      },
    });

    if (!membership) {
      return [];
    }

    const total = await this.prisma.membership.count({
      where: {
        associationId,
      },
    });

    return [
      {
        month: new Date().toISOString().slice(0, 7),
        count: total,
      },
    ];
  }
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

  async recentActivity(associationId: string, userId: string) {
    await this.ensureMembership(userId, associationId);

    const [invitations, events, transactions] = await Promise.all([
      this.prisma.invitation.findMany({
        where: { associationId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      this.prisma.event.findMany({
        where: { associationId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      this.prisma.transaction.findMany({
        where: { associationId },
        orderBy: { date: "desc" },
        take: 5,
      }),
    ]);

    const invitationItems = invitations.map((invitation) => ({
      id: `invitation-${invitation.id}`,
      title: "Nuovo invito",
      description: `Invito inviato a ${invitation.email}`,
      icon: "notification" as const,
      createdAt: invitation.createdAt,
    }));

    const eventItems = events.map((event) => ({
      id: `event-${event.id}`,
      title: "Evento creato",
      description: event.title,
      icon: "event" as const,
      createdAt: event.createdAt,
    }));

    const transactionItems = transactions.map((transaction) => ({
      id: `transaction-${transaction.id}`,
      title:
        transaction.type === "INCOME"
          ? "Entrata registrata"
          : "Uscita registrata",
      description:
        transaction.title ??
        transaction.description ??
        `${(transaction.amountCents / 100).toFixed(2)} €`,
      icon: "finance" as const,
      createdAt: transaction.date,
    }));

    return [
      ...invitationItems,
      ...eventItems,
      ...transactionItems,
    ]
      .sort(
        (a, b) =>
          b.createdAt.getTime() -
          a.createdAt.getTime(),
      )
      .slice(0, 10);
  }
}






