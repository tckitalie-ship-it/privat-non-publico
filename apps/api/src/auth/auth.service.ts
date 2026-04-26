import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

type JwtPayload = {
  sub: string;
  email: string;
  associationId: string | null;
  role: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        memberships: {
          include: {
            association: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const activeMembership = user.memberships[0] ?? null;

    return {
      id: user.id,
      email: user.email,
      activeMembership: activeMembership
        ? {
            associationId: activeMembership.associationId,
            role: activeMembership.role,
          }
        : null,
    };
  }

  async signToken(user: {
    id: string;
    email: string;
    activeMembership?: {
      associationId: string;
      role: string;
    } | null;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      associationId: user.activeMembership?.associationId ?? null,
      role: user.activeMembership?.role ?? null,
    };

    return this.jwtService.signAsync(payload);
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    return {
      access_token: await this.signToken(user),
      user,
    };
  }

  async me(userId: string) {
    return this.usersService.findById(userId);
  }

  async switchAssociation(userId: string, associationId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        associationId,
      },
      include: {
        association: true,
      },
    });

    if (!membership) {
      throw new UnauthorizedException('User is not member of this association');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const accessToken = await this.signToken({
      id: user.id,
      email: user.email,
      activeMembership: {
        associationId: membership.associationId,
        role: membership.role,
      },
    });

    return {
      access_token: accessToken,
      activeAssociation: {
        id: membership.association.id,
        name: membership.association.name,
        role: membership.role,
      },
    };
  }
}