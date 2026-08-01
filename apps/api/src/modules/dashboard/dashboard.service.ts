import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpis() {
    const [
      associations,
      users,
      memberships,
      events,
      eventRegistrations,
      transactions,
    ] = await Promise.all([
      this.prisma.association.count(),
      this.prisma.user.count(),
      this.prisma.membership.count(),
      this.prisma.event.count(),
      this.prisma.eventRegistration.count(),
      this.prisma.transaction.findMany(),
    ]);

    const incomeCents = transactions
      .filter((transaction) => transaction.type === 'INCOME')
      .reduce((sum, transaction) => sum + transaction.amountCents, 0);

    const expenseCents = transactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .reduce((sum, transaction) => sum + transaction.amountCents, 0);

    return {
      associations,
      users,
      memberships,
      events,
      eventRegistrations,
      transactions: transactions.length,
      incomeCents,
      expenseCents,
      balanceCents: incomeCents - expenseCents,
    };
  }
}