import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(user: any) {
    if (!user.associationId) {
      throw new BadRequestException('No active association selected');
    }

    const associationId = user.associationId;

    const totalMembers = await this.prisma.membership.count({
      where: {
        associationId,
      },
    });

    return {
      associationId,
      members: {
        total: totalMembers,
      },
      events: {
        total: 0,
        upcoming: 0,
      },
      finance: {
        income: 0,
        expenses: 0,
        balance: 0,
      },
    };
  }
}