import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getKpis(user: any) {
    if (!user?.id) {
      throw new UnauthorizedException(
        'Utente non autenticato',
      );
    }

    if (!user?.associationId) {
      throw new UnauthorizedException(
        'Nessuna associazione attiva',
      );
    }

    const associationId = user.associationId;

    const [
      associationsCount,
      membersCount,
      eventsCount,
      incomeAgg,
      expenseAgg,
    ] = await Promise.all([
      this.prisma.membership.count({
        where: {
          userId: user.id,
        },
      }),

      this.prisma.membership.count({
        where: {
          associationId,
        },
      }),

      this.prisma.event.count({
        where: {
          associationId,
        },
      }),

      this.prisma.transaction.aggregate({
        where: {
          associationId,
          type: 'INCOME',
        },
        _sum: {
          amountCents: true,
        },
      }),

      this.prisma.transaction.aggregate({
        where: {
          associationId,
          type: 'EXPENSE',
        },
        _sum: {
          amountCents: true,
        },
      }),
    ]);

    const incomeCents =
      incomeAgg._sum.amountCents ?? 0;

    const expenseCents =
      expenseAgg._sum.amountCents ?? 0;

    return {
      associationsCount,
      membersCount,
      eventsCount,
      incomeCents,
      expenseCents,
      balanceCents:
        incomeCents - expenseCents,
    };
  }

  async getRevenueChart(user: any) {
    if (!user?.id) {
      throw new UnauthorizedException(
        'Utente non autenticato',
      );
    }

    if (!user?.associationId) {
      throw new UnauthorizedException(
        'Nessuna associazione attiva',
      );
    }

    const associationId = user.associationId;

    const now = new Date();

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1,
    );

    const transactions =
      await this.prisma.transaction.findMany({
        where: {
          associationId,
          date: {
            gte: startDate,
          },
        },
        select: {
          type: true,
          amountCents: true,
          date: true,
        },
        orderBy: {
          date: 'asc',
        },
      });

    const months = new Map<
      string,
      {
        month: string;
        revenue: number;
        expenses: number;
        balance: number;
      }
    >();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1,
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;

      const month = date.toLocaleDateString(
        'it-IT',
        {
          month: 'short',
        },
      );

      months.set(key, {
        month,
        revenue: 0,
        expenses: 0,
        balance: 0,
      });
    }

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;

      const item = months.get(key);

      if (!item) return;

      const amount = transaction.amountCents / 100;

      if (transaction.type === 'INCOME') {
        item.revenue += amount;
      }

      if (transaction.type === 'EXPENSE') {
        item.expenses += amount;
      }

      item.balance =
        item.revenue - item.expenses;
    });

    return Array.from(months.values());
  }
}