import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async create(currentUser: any, dto: CreateInvitationDto) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    if (!['OWNER', 'ADMIN'].includes(currentUser.role)) {
      throw new ForbiddenException('Only OWNER or ADMIN can invite members');
    }

    const email = dto.email.trim().toLowerCase();

    const existingMembership = await this.prisma.membership.findFirst({
      where: {
        associationId: currentUser.associationId,
        user: {
          email,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('User is already a member');
    }

    const existingInvite = await this.prisma.invite.findFirst({
      where: {
        email,
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
        email,
        role: dto.role,
        token: randomBytes(32).toString('hex'),
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
      where: {
        token,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException('Invite already used');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite expired');
    }

    if (invite.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      throw new ForbiddenException('Invite email mismatch');
    }

    const existingMembership = await this.prisma.membership.findFirst({
      where: {
        userId: currentUser.id,
        associationId: invite.associationId,
      },
    });

    if (existingMembership) {
      throw new BadRequestException('User is already a member');
    }

    const membership = await this.prisma.$transaction(async (tx) => {
      const createdMembership = await tx.membership.create({
        data: {
          userId: currentUser.id,
          associationId: invite.associationId,
          role: invite.role,
        },
      });

      await tx.invite.update({
        where: {
          id: invite.id,
        },
        data: {
          status: 'ACCEPTED',
        },
      });

      return createdMembership;
    });

    const accessToken = this.jwtService.sign({
      sub: currentUser.id,
      email: currentUser.email,
      associationId: invite.associationId,
      role: invite.role,
    });

    return {
      success: true,
      access_token: accessToken,
      associationId: invite.associationId,
      role: invite.role,
      membership,
    };
  }
}