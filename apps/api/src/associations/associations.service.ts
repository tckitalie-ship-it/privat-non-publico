import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';

@Injectable()
export class AssociationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    return this.prisma.association.findMany({
      where: { memberships: { some: { userId } } },
      include: { memberships: true, events: true },
    });
  }

  async findOneForUser(id: string, userId: string) {
    const association = await this.prisma.association.findUnique({
      where: { id },
      include: { memberships: true, events: true },
    });

    if (!association) throw new NotFoundException('Associazione non trovata');

    const isMember = association.memberships.some(m => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Accesso negato');

    return association;
  }

  async create(dto: CreateAssociationDto, userId: string) {
    return this.prisma.association.create({
      data: {
        name: dto.name,
        description: dto.description ?? '',
      
        memberships: {
          create: { userId, role: 'OWNER' },
        },
      },
      include: { memberships: true, events: true },
    });
  }

  async update(id: string, dto: UpdateAssociationDto, userId: string) {
    await this.ensureOwnerOrAdmin(id, userId);

    return this.prisma.association.update({
      where: { id },
      data: dto,
      include: { memberships: true, events: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.ensureOwnerOrAdmin(id, userId);

    return this.prisma.association.delete({
      where: { id },
    });
  }

  private async ensureOwnerOrAdmin(id: string, userId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { associationId: id, userId },
    });

    if (!membership) throw new ForbiddenException('Non sei membro di questa associazione');

    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw new ForbiddenException('Permessi insufficienti');
    }
  }
}
