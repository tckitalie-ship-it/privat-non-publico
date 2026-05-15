import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const memberships = await this.prisma.membership.findMany({
      where: {
        userId: user.id,
      },
      include: {
        association: true,
      },
    });

    const activeMembership = memberships[0];

    const payload = {
      sub: user.id,
      email: user.email,
      associationId: activeMembership?.associationId,
      role: activeMembership?.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
      },
      association: activeMembership?.association
        ? {
            id: activeMembership.association.id,
            name: activeMembership.association.name,
            role: activeMembership.role,
          }
        : null,
    };
  }

  async me(currentUser: any) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      ...user,
      associationId: currentUser.associationId,
      role: currentUser.role,
    };
  }

  async switchAssociation(currentUser: any, associationId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_associationId: {
          userId: currentUser.id,
          associationId,
        },
      },
      include: {
        association: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Membership not found');
    }

    if (!membership.association.isActive) {
      throw new ForbiddenException('Association is inactive');
    }

    const payload = {
      sub: currentUser.id,
      email: currentUser.email,
      associationId: membership.associationId,
      role: membership.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      association: {
        id: membership.association.id,
        name: membership.association.name,
        role: membership.role,
      },
    };
  }

  async changePassword(currentUser: any, dto: ChangePasswordDto) {
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'La nuova password deve essere diversa da quella attuale',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Password attuale non corretta');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    });

    return {
      success: true,
      message: 'Password aggiornata',
    };
  }
}