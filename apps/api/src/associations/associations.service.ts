import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssociationDto } from './dto/create-association.dto';

type UpdateAssociationSettingsDto = {
  name?: string;
  description?: string | null;
};

@Injectable()
export class AssociationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUserId: string, dto: CreateAssociationDto) {
    return this.prisma.$transaction(async (tx) => {
      const association = await tx.association.create({
        data: {
          name: dto.name,
          description: dto.description ?? null,
        },
      });

      await tx.membership.create({
        data: {
          userId: currentUserId,
          associationId: association.id,
          role: 'OWNER',
        },
      });

      return tx.association.findUnique({
        where: { id: association.id },
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async me(currentUser: any) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    const association = await this.prisma.association.findUnique({
      where: {
        id: currentUser.associationId,
      },
      include: {
        memberships: true,
        invitations: true,
      },
    });

    if (!association) {
      throw new NotFoundException('Association not found');
    }

    return {
      id: association.id,
      name: association.name,
      description: association.description,
      logoUrl: association.logoUrl,
      isActive: association.isActive,
      createdAt: association.createdAt,
      membersCount: association.memberships.length,
      invitationsCount: association.invitations.length,
    };
  }

  async updateMe(currentUser: any, dto: UpdateAssociationSettingsDto) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    if (!['OWNER', 'ADMIN'].includes(currentUser.role)) {
      throw new ForbiddenException('Only OWNER or ADMIN can update settings');
    }

    return this.prisma.association.update({
      where: {
        id: currentUser.associationId,
      },
      data: {
        name: dto.name,
        description: dto.description === '' ? null : dto.description,
      },
    });
  }

  async updateLogo(currentUser: any, logoUrl: string) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    if (!['OWNER', 'ADMIN'].includes(currentUser.role)) {
      throw new ForbiddenException('Only OWNER or ADMIN can update logo');
    }

    return this.prisma.association.update({
      where: {
        id: currentUser.associationId,
      },
      data: {
        logoUrl,
      },
    });
  }

  async setActive(id: string, isActive: boolean, currentUser: any) {
    if (currentUser.associationId !== id) {
      throw new ForbiddenException('Wrong association');
    }

    if (currentUser.role !== 'OWNER') {
      throw new ForbiddenException('Only OWNER can change association status');
    }

    return this.prisma.association.update({
      where: { id },
      data: { isActive },
    });
  }
}