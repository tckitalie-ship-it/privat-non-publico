import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: any) {
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
        association: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async me(user: any) {
    return this.prisma.membership.findFirst({
      where: {
        userId: user.id,
        associationId: user.associationId,
      },
      include: {
        association: true,
      },
    });
  }

  async updateRole(id: string, role: Role, user: any) {
    const membership = await this.prisma.membership.findUnique({
      where: { id },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.associationId !== user.associationId) {
      throw new ForbiddenException();
    }

    return this.prisma.membership.update({
      where: { id },
      data: { role },
    });
  }

  async remove(id: string, user: any) {
    const membership = await this.prisma.membership.findUnique({
      where: { id },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.associationId !== user.associationId) {
      throw new ForbiddenException();
    }

    return this.prisma.membership.delete({
      where: { id },
    });
  }
}