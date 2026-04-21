import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssociationDto } from './dto/create-association.dto';

@Injectable()
export class AssociationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUserId: string, dto: CreateAssociationDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const association = await tx.association.create({
          data: {
            name: dto.name,
            slug: dto.slug,
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Association slug already exists');
      }

      throw error;
    }
  }
}