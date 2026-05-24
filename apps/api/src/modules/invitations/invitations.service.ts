import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { randomBytes } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll() {
    return this.prisma.invitation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        association: true,
        invitedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async create(params: {
    email: string;
    role?: 'OWNER' | 'ADMIN' | 'MEMBER';
    associationId: string;
    invitedById: string;
  }) {
    const token = randomBytes(32).toString('hex');

    const invitation = await this.prisma.invitation.create({
      data: {
        email: params.email,
        role: params.role || 'MEMBER',
        associationId: params.associationId,
        invitedById: params.invitedById,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });

    await this.notificationsService.create({
      associationId: params.associationId,
      title: 'Nuovo invito inviato',
      message: `Invito inviato a ${params.email}`,
      userId: null,
    });

    return invitation;
  }

  async remove(id: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      throw new NotFoundException('Invito non trovato');
    }

    await this.prisma.invitation.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }

  async accept(token: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invito non trovato');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException('Invito già accettato');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invito scaduto');
    }

    const membership = await this.prisma.membership.upsert({
      where: {
        userId_associationId: {
          userId,
          associationId: invitation.associationId,
        },
      },
      update: {
        role: invitation.role,
      },
      create: {
        userId,
        associationId: invitation.associationId,
        role: invitation.role,
      },
    });

    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        acceptedAt: new Date(),
      },
    });

    await this.notificationsService.create({
      associationId: invitation.associationId,
      title: 'Invito accettato',
      message: `${invitation.email} ha accettato l’invito`,
      userId: null,
    });

    return membership;
  }
}