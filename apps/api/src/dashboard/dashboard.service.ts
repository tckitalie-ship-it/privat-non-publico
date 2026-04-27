import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(currentUser: any) {
    if (!currentUser.associationId) {
      throw new ForbiddenException(
        'No active association selected',
      );
    }

    const membersCount =
      await this.prisma.membership.count({
        where: {
          associationId: currentUser.associationId,
        },
      });

    const eventsCount =
      await this.prisma.event.count({
        where: {
          associationId: currentUser.associationId,
        },
      });

    const invitesPending =
      await this.prisma.invite.count({
        where: {
          associationId: currentUser.associationId,
          status: 'PENDING',
        },
      });

    return {
      membersCount,
      eventsCount,
      invitesPending,
    };
  }

  async getKpis(currentUser: any) {
    if (!currentUser.associationId) {
      throw new ForbiddenException(
        'No active association selected',
      );
    }

    const associationId = currentUser.associationId;

    const [
      membersCount,
      eventsCount,
      registrationsCount,
      transactions,
    ] = await Promise.all([
      this.prisma.membership.count({
        where: { associationId },
      }),

      this.prisma.event.count({
        where: { associationId },
      }),

      this.prisma.eventRegistration.count({
        where: {
          event: {
            associationId,
          },
        },
      }),

      this.prisma.transaction.findMany({
        where: { associationId },
      }),
    ]);

    const incomeCents = transactions
      .filter(t => t.type === 'INCOME')
      .reduce(
        (sum, t) => sum + t.amountCents,
        0,
      );

    const expenseCents = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce(
        (sum, t) => sum + t.amountCents,
        0,
      );

    return {
      membersCount,
      eventsCount,
      registrationsCount,
      incomeCents,
      expenseCents,
      balanceCents: incomeCents - expenseCents,
      avgRevenuePerMember:
        membersCount > 0
          ? Math.round(incomeCents / membersCount)
          : 0,
    };
  }
}