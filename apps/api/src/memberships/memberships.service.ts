import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByAssociation(associationId: string) {
    return this.prisma.membership.findMany({
      where: { associationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }
}