import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembershipsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: {
    userId: string;
    associationId: string;
    role?: string;
  }) {
    return this.prisma.membership.create({
      data: {
        userId: dto.userId,
        associationId: dto.associationId,
        role: dto.role ?? 'member',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        association: true,
      },
    });
  }

  async findAllByAssociation(
    associationId: string,
  ) {
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
      },
    });
  }
}