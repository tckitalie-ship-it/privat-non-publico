import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssociationDto } from './dto/create-association.dto';

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