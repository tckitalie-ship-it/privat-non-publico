import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  async findAll(associationId: string) {
    return this.prisma.membership.findMany({
      where: {
        associationId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        association: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}