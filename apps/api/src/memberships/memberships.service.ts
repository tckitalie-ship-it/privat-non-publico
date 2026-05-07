import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: {
    userId: string;
    associationId: string;
    role?: Role;
  }) {
    return this.prisma.membership.create({
      data: {
        userId: dto.userId,
        associationId: dto.associationId,
        role: dto.role ?? Role.MEMBER,
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

  async findAll(user: any) {
    if (!user.associationId) {
      throw new BadRequestException('No active association selected');
    }

    return this.prisma.membership.findMany({
      where: {
        associationId: user.associationId,
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
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async me(user: any) {
    if (!user.associationId) {
      throw new BadRequestException('No active association selected');
    }

    return this.prisma.membership.findUnique({
      where: {
        userId_associationId: {
          userId: user.id,
          associationId: user.associationId,
        },
      },
      include: {
        association: true,
      },
    });
  }

  async findMe(userId: string, associationId?: string) {
    if (!associationId) {
      throw new BadRequestException('No active association selected');
    }

    return this.prisma.membership.findUnique({
      where: {
        userId_associationId: {
          userId,
          associationId,
        },
      },
      include: {
        association: true,
      },
    });
  }

  async updateRole(id: string, role: Role, user: any) {
    if (!user.associationId) {
      throw new BadRequestException('No active association selected');
    }

    if (role === Role.OWNER) {
      throw new BadRequestException('Cannot assign OWNER role here');
    }

    const membership = await this.prisma.membership.findUnique({
      where: { id },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.associationId !== user.associationId) {
      throw new ForbiddenException('Cannot manage member from another association');
    }

    if (membership.role === Role.OWNER) {
      throw new BadRequestException('Cannot change OWNER role');
    }

    return this.prisma.membership.update({
      where: { id },
      data: { role },
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

  async remove(id: string, user: any) {
    if (!user.associationId) {
      throw new BadRequestException('No active association selected');
    }

    const membership = await this.prisma.membership.findUnique({
      where: { id },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.associationId !== user.associationId) {
      throw new ForbiddenException('Cannot remove member from another association');
    }

    if (membership.role === Role.OWNER) {
      throw new BadRequestException('Cannot remove OWNER');
    }

    return this.prisma.membership.delete({
      where: { id },
    });
  }
}