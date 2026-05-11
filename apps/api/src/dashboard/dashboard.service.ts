import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpis(user: any) {
    if (!user.associationId) {
      throw new UnauthorizedException('Nessuna associazione attiva');
    }

    const associationId = user.associationId;

    const [membersCount, eventsCount, transactions] = await Promise.all([
      this.prisma.membership.count({
        where: { associationId },
      }),
      this.prisma.event.count({
        where: { associationId },
      }),
      this.prisma.transaction.findMany({
        where: { associationId },
        select: {
          type: true,
          amountCents: true,
        },
      }),
    ]);

    const incomeCents = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amountCents, 0);

    const expenseCents = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amountCents, 0);

    return {
      membersCount,
      eventsCount,
      incomeCents,
      expenseCents,
      balanceCents: incomeCents - expenseCents,
    };
  }
}