import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpis(user: any) {
    if (!user?.id) {
      throw new UnauthorizedException('Utente non autenticato');
    }

    if (!user?.associationId) {
      throw new UnauthorizedException('Nessuna associazione attiva');
    }

    const associationId = user.associationId;

    const [associationsCount, membersCount, eventsCount, incomeAgg, expenseAgg] =
      await Promise.all([
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

    const incomeCents = incomeAgg._sum.amountCents ?? 0;
    const expenseCents = expenseAgg._sum.amountCents ?? 0;

    return {
      associationsCount,
      membersCount,
      eventsCount,
      incomeCents,
      expenseCents,
      balanceCents: incomeCents - expenseCents,
    };
  }
}