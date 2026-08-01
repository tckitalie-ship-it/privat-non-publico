import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { PrismaService } from "../prisma/prisma.service";

type RegisterBody = {
  email?: string;
  password?: string;
};

type LoginBody = {
  email?: string;
  password?: string;
};

type ChangePasswordBody = {
  currentPassword?: string;
  oldPassword?: string;
  newPassword?: string;
  password?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(body: RegisterBody) {
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      throw new BadRequestException("Email e password sono obbligatorie");
    }

    if (password.length < 8) {
      throw new BadRequestException(
        "La password deve contenere almeno 8 caratteri"
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("Esiste già un account con questa email");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user,
      associations: [],
    };
  }

  async login(body: LoginBody) {
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      throw new BadRequestException("Email e password sono obbligatorie");
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            association: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException("Email o password non corretti");
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new UnauthorizedException(
        "Account temporaneamente bloccato. Riprova più tardi"
      );
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordIsValid) {
      const failedAttempts = user.failedAttempts + 1;
      const mustLock = failedAttempts >= 5;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: mustLock ? 0 : failedAttempts,
          lockUntil: mustLock
            ? new Date(Date.now() + 15 * 60 * 1000)
            : null,
        },
      });

      throw new UnauthorizedException("Email o password non corretti");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockUntil: null,
      },
    });

    const firstMembership = user.memberships[0];

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      associationId: firstMembership?.associationId,
      role: firstMembership?.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      associations: user.memberships.map((membership) => ({
        membershipId: membership.id,
        role: membership.role,
        association: membership.association,
      })),
      activeAssociationId: firstMembership?.associationId ?? null,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          include: {
            association: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException("Utente non trovato");
    }

    return user;
  }

  async changePassword(userId: string, body: ChangePasswordBody) {
    const currentPassword = body.currentPassword ?? body.oldPassword;
    const newPassword = body.newPassword ?? body.password;

    if (!currentPassword || !newPassword) {
      throw new BadRequestException(
        "Password attuale e nuova password sono obbligatorie"
      );
    }

    if (newPassword.length < 8) {
      throw new BadRequestException(
        "La nuova password deve contenere almeno 8 caratteri"
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("Utente non trovato");
    }

    const passwordIsValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException("Password attuale non corretta");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        failedAttempts: 0,
        lockUntil: null,
      },
    });

    return {
      message: "Password aggiornata correttamente",
    };
  }

  async switchAssociation(userId: string, associationId: string) {
    if (!associationId) {
      throw new BadRequestException("Association ID obbligatorio");
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_associationId: {
          userId,
          associationId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        association: true,
      },
    });

    if (!membership || !membership.association.isActive) {
      throw new UnauthorizedException(
        "Non hai accesso a questa associazione"
      );
    }

    const accessToken = await this.jwtService.signAsync({
      sub: membership.user.id,
      email: membership.user.email,
      associationId: membership.associationId,
      role: membership.role,
    });

    return {
      accessToken,
      activeAssociationId: membership.associationId,
      role: membership.role,
      association: membership.association,
    };
  }
}