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

    const existingInvite = await this.prisma.invite.findFirst({
      where: {
        email: dto.email,
        associationId: currentUser.associationId,
        status: 'PENDING',
      },
    });

    if (existingInvite) {
      throw new BadRequestException('Pending invite already exists');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.prisma.invite.create({
      data: {
        email: dto.email,
        role: dto.role,
        token: randomUUID(),
        associationId: currentUser.associationId,
        expiresAt,
      },
    });
  }

  async findAll(currentUser: any) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    return this.prisma.invite.findMany({
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

    const invite = await this.prisma.invite.findUnique({
      where: { token },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('Invite already used');
    }

    if (invite.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      throw new ForbiddenException('Invite email mismatch');
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: currentUser.id,
        associationId: invite.associationId,
      },
    });

    if (membership) {
      throw new BadRequestException('User is already a member');
    }

    const createdMembership = await this.prisma.membership.create({
      data: {
        userId: currentUser.id,
        associationId: invite.associationId,
        role: invite.role,
      },
    });

    await this.prisma.invite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED' },
    });

    return {
      success: true,
      associationId: invite.associationId,
      role: invite.role,
      membership: createdMembership,
    };
  }
}