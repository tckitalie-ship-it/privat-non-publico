import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUser: any, dto: CreateInvitationDto) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    if (!['OWNER', 'ADMIN'].includes(currentUser.role)) {
      throw new ForbiddenException('Only OWNER or ADMIN can invite members');
    }

    const association = await this.prisma.association.findUnique({
      where: { id: currentUser.associationId },
    });

    if (!association) {
      throw new NotFoundException('Association not found');
    }

    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        email: dto.email,
        associationId: currentUser.associationId,
        status: 'PENDING',
      },
    });

    if (existingInvitation) {
      throw new BadRequestException('Pending invitation already exists');
    }

    return this.prisma.invitation.create({
      data: {
        email: dto.email,
        role: dto.role,
        token: randomUUID(),
        associationId: currentUser.associationId,
        invitedByUserId: currentUser.id,
      },
    });
  }

  async findAll(currentUser: any) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    return this.prisma.invitation.findMany({
      where: {
        associationId: currentUser.associationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async accept(currentUser: any, token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Invitation already used');
    }

    if (invitation.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      throw new ForbiddenException('Invitation email mismatch');
    }

    return this.prisma.$transaction(async (tx) => {
      const existingMembership = await tx.membership.findUnique({
        where: {
          userId_associationId: {
            userId: currentUser.id,
            associationId: invitation.associationId,
          },
        },
      });

      if (existingMembership) {
        throw new BadRequestException('User is already a member');
      }

      const membership = await tx.membership.create({
        data: {
          userId: currentUser.id,
          associationId: invitation.associationId,
          role: invitation.role,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      });

      return {
        success: true,
        associationId: invitation.associationId,
        role: invitation.role,
        membership,
      };
    });
  }
}