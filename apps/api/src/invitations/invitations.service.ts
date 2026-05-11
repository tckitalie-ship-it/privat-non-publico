import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Injectable()
export class InvitationsService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async create(user: any, dto: CreateInvitationDto) {
    if (!user.associationId) {
      throw new BadRequestException('No active association');
    }

    if (dto.role === Role.OWNER) {
      throw new BadRequestException('Cannot invite OWNER');
    }

    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.invitation.findUnique({
      where: {
        email_associationId: {
          email,
          associationId: user.associationId,
        },
      },
    });

    if (existing && !existing.acceptedAt) {
      throw new ConflictException('Invitation already exists');
    }

    const token = randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.invitation.create({
      data: {
        email,
        role: dto.role,
        token,
        expiresAt,
        associationId: user.associationId,
        invitedById: user.id,
      },
    });

    const inviteLink = `${process.env.APP_FRONTEND_URL}/invite?token=${token}`;

    try {
      const response = await this.resend.emails.send({
        from: process.env.INVITATION_FROM_EMAIL!,
        to: invitation.email,
        subject: 'Sei stato invitato',
        html: `
          <h2>Invito</h2>
          <p>Sei stato invitato a unirti alla piattaforma.</p>
          <a href="${inviteLink}">Accetta invito</a>
        `,
      });
      console.log('EMAIL RESPONSE:', response);
    } catch (error) {
      console.error('EMAIL ERROR:', error);
    }

    return invitation;
  }

  async accept(user: any, token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new BadRequestException('Invalid token');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException('Already accepted');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation expired');
    }

    if (invitation.email !== user.email) {
      throw new BadRequestException('Wrong user for this invitation');
    }

    const existingMembership = await this.prisma.membership.findUnique({
      where: {
        userId_associationId: {
          userId: user.id,
          associationId: invitation.associationId,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException('Already a member');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.membership.create({
        data: {
          userId: user.id,
          associationId: invitation.associationId,
          role: invitation.role,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          acceptedAt: new Date(),
        },
      });
    });

    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      associationId: invitation.associationId,
      role: invitation.role,
    });

    return { access_token };
  }
}