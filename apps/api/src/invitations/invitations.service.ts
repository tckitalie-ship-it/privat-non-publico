import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { randomUUID } from "crypto";
import * as bcrypt from "bcrypt";

interface CreateInvitationDto {
  email: string;
  role: string;
  associationId?: string;
}

interface AcceptAndRegisterDto {
  token: string;
  email: string;
  password: string;
}

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private async notify(
    userId: string,
    associationId: string,
    title: string,
    message: string,
  ) {
    const existing =
      await this.prisma.notification.findFirst({
        where: {
          userId,
          associationId,
          title,
          message,
        },
      });

    if (existing) {
      return existing;
    }

    const notification =
      await this.prisma.notification.create({
        data: {
          title,
          message,
          read: false,
          associationId,
          userId,
        },
      });

    NotificationsGateway.emitNotification(
      notification,
    );

    return notification;
  }

  private async notifyManagers(
    associationId: string,
    title: string,
    message: string,
    excludeUserId?: string,
  ) {
    const managers =
      await this.prisma.membership.findMany({
        where: {
          associationId,
          role: {
            in: ["OWNER", "ADMIN"] as any,
          },
          ...(excludeUserId
            ? {
                userId: {
                  not: excludeUserId,
                },
              }
            : {}),
        },
        select: {
          userId: true,
        },
      });

    for (const manager of managers) {
      await this.notify(
        manager.userId,
        associationId,
        title,
        message,
      );
    }
  }

  async findAll(
    userId: string,
    associationId: string,
  ) {
    if (!userId) {
      throw new BadRequestException(
        "Utente non valido.",
      );
    }

    if (!associationId) {
      throw new BadRequestException(
        "Associazione non valida.",
      );
    }

    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Non appartieni a questa associazione.",
      );
    }

    const requesterRole = String(membership.role)
      .trim()
      .toUpperCase();

    if (requesterRole !== "OWNER" && requesterRole !== "ADMIN") {
      throw new ForbiddenException(
        "Non hai il permesso di visualizzare gli inviti.",
      );
    }



    return this.prisma.invitation.findMany({
      where: {
        associationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        association: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async createInvitation(
    userId: string,
    dto: CreateInvitationDto,
  ) {
    const email = dto.email
      ?.trim()
      .toLowerCase();

    const role = dto.role
      ?.trim()
      .toUpperCase();

    if (!userId) {
      throw new BadRequestException(
        "Utente non valido.",
      );
    }

    if (!email) {
      throw new BadRequestException(
        "Email mancante.",
      );
    }

    if (!role) {
      throw new BadRequestException(
        "Ruolo mancante.",
      );
    }

    const allowedRoles = [
      "OWNER",
      "ADMIN",
      "MEMBER",
    ];

    if (!allowedRoles.includes(role)) {
      throw new BadRequestException(
        "Ruolo non valido.",
      );
    }

    const associationId =
      dto.associationId?.trim();

    if (!associationId) {
      throw new BadRequestException(
        "Associazione mancante.",
      );
    }

    const requesterMembership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId,
        },
      });

    if (!requesterMembership) {
      throw new ForbiddenException(
        "Non appartieni a questa associazione.",
      );
    }

    const requesterRole = String(
      requesterMembership.role,
    )
      .trim()
      .toUpperCase();

    if (
      requesterRole !== "OWNER" &&
      requesterRole !== "ADMIN"
    ) {
      throw new ForbiddenException(
        "Non hai il permesso di creare inviti.",
      );
    }

    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
        },
      });

    if (existingUser) {
      const existingMembership =
        await this.prisma.membership.findFirst({
          where: {
            userId: existingUser.id,
            associationId,
          },
        });

      if (existingMembership) {
        throw new ConflictException(
          "Questo utente appartiene giÃ  all'associazione.",
        );
      }
    }

    await this.prisma.invitation.deleteMany({
      where: {
        associationId,
        email,
      },
    });

    const token = randomUUID();

    const invitation =
      await this.prisma.invitation.create({
        data: {
          associationId,
          email,
          role: role as any,
          token,
          invitedById: userId,
          expiresAt: new Date(
            Date.now() +
              7 * 24 * 60 * 60 * 1000,
          ),
        },
        include: {
          association: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    if (
      existingUser &&
      existingUser.id !== userId
    ) {
      await this.notify(
        existingUser.id,
        associationId,
        "Nuovo invito",
        `Sei stato invitato a partecipare all'associazione "${invitation.association?.name ?? "associazione"}" con ruolo ${role}.`,
      );
    }

    return invitation;
  }

  async checkToken(token: string) {
    const normalizedToken = token?.trim();

    if (!normalizedToken) {
      throw new BadRequestException(
        "Token dell'invito mancante.",
      );
    }

    const invitation =
      await this.prisma.invitation.findUnique({
        where: {
          token: normalizedToken,
        },
        include: {
          association: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    if (!invitation) {
      throw new NotFoundException(
        "Invito non valido.",
      );
    }

    const expired =
      invitation.expiresAt !== null &&
      invitation.expiresAt.getTime() <
        Date.now();

    if (expired) {
      throw new BadRequestException(
        "Invito scaduto.",
      );
    }

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      token: invitation.token,
      associationId:
        invitation.associationId,
      associationName:
        invitation.association?.name ?? null,
      expiresAt: invitation.expiresAt,
      valid: true,
    };
  }

  async acceptInvitation(
    token: string,
    userId: string,
  ) {
    const normalizedToken = token?.trim();

    if (!normalizedToken) {
      throw new BadRequestException(
        "Token dell'invito mancante.",
      );
    }

    if (!userId) {
      throw new BadRequestException(
        "Utente non valido.",
      );
    }

    const invitation =
      await this.prisma.invitation.findUnique({
        where: {
          token: normalizedToken,
        },
        include: {
          association: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    if (!invitation) {
      throw new NotFoundException(
        "Invito non valido.",
      );
    }

    if (
      invitation.expiresAt &&
      invitation.expiresAt.getTime() <
        Date.now()
    ) {
      throw new BadRequestException(
        "Invito scaduto.",
      );
    }

    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
        },
      });

    if (!user) {
      throw new NotFoundException(
        "Utente non trovato.",
      );
    }

    if (
      user.email.trim().toLowerCase() !==
      invitation.email.trim().toLowerCase()
    ) {
      throw new ForbiddenException(
        "L'invito appartiene a un altro indirizzo email.",
      );
    }

    const existingMembership =
      await this.prisma.membership.findFirst({
        where: {
          associationId:
            invitation.associationId,
          userId,
        },
      });

    if (existingMembership) {
      await this.prisma.invitation.delete({
        where: {
          id: invitation.id,
        },
      });

      return {
        success: true,
        alreadyMember: true,
        associationId:
          invitation.associationId,
      };
    }

    await this.prisma.$transaction([
      this.prisma.membership.create({
        data: {
          associationId:
            invitation.associationId,
          userId,
          role: invitation.role as any,
        },
      }),
      this.prisma.invitation.delete({
        where: {
          id: invitation.id,
        },
      }),
    ]);

    await this.notifyManagers(
      invitation.associationId,
      "Invito accettato",
      `${user.email} ha accettato l'invito ed è entrato nell'associazione "${invitation.association?.name ?? "associazione"}" con ruolo ${invitation.role}.`,
      userId,
    );

    return {
      success: true,
      alreadyMember: false,
      associationId:
        invitation.associationId,
    };
  }

  async acceptAndRegister(
    dto: AcceptAndRegisterDto,
  ) {
    const token = dto.token?.trim();
    const email = dto.email
      ?.trim()
      .toLowerCase();
    const password = dto.password;

    if (!token) {
      throw new BadRequestException(
        "Token dell'invito mancante.",
      );
    }

    if (!email) {
      throw new BadRequestException(
        "Email mancante.",
      );
    }

    if (!password) {
      throw new BadRequestException(
        "Password mancante.",
      );
    }

    if (password.length < 8) {
      throw new BadRequestException(
        "La password deve contenere almeno 8 caratteri.",
      );
    }

    const invitation =
      await this.prisma.invitation.findUnique({
        where: {
          token,
        },
        include: {
          association: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    if (!invitation) {
      throw new NotFoundException(
        "Invito non valido.",
      );
    }

    if (
      invitation.expiresAt &&
      invitation.expiresAt.getTime() <
        Date.now()
    ) {
      throw new BadRequestException(
        "Invito scaduto.",
      );
    }

    if (
      invitation.email.trim().toLowerCase() !==
      email
    ) {
      throw new BadRequestException(
        "L'email non corrisponde all'invito.",
      );
    }

    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        "Esiste giÃ  un account con questa email. Effettua il login per accettare l'invito.",
      );
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const result =
      await this.prisma.$transaction(
        async (transaction) => {
          const user =
            await transaction.user.create({
              data: {
                email,
                passwordHash,
              },
            });

          await transaction.membership.create({
            data: {
              associationId:
                invitation.associationId,
              userId: user.id,
              role: invitation.role as any,
            },
          });

          await transaction.invitation.delete({
            where: {
              id: invitation.id,
            },
          });

          return {
            userId: user.id,
            associationId:
              invitation.associationId,
          };
        },
      );

    await this.notifyManagers(
      result.associationId,
      "Nuovo membro",
      `${email} ha accettato l'invito ed è entrato nell'associazione "${invitation.association?.name ?? "associazione"}" con ruolo ${invitation.role}.`,
      result.userId,
    );

    return {
      success: true,
      userId: result.userId,
      associationId:
        result.associationId,
    };
  }

  async resendInvitation(
    invitationId: string,
    userId: string,
  ) {
    if (!invitationId) {
      throw new BadRequestException(
        "ID invito mancante.",
      );
    }

    if (!userId) {
      throw new BadRequestException(
        "Utente non valido.",
      );
    }

    const invitation =
      await this.prisma.invitation.findUnique({
        where: {
          id: invitationId,
        },
        include: {
          association: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    if (!invitation) {
      throw new NotFoundException(
        "Invito non trovato.",
      );
    }

    const requesterMembership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId:
            invitation.associationId,
        },
      });

    if (!requesterMembership) {
      throw new ForbiddenException(
        "Non appartieni a questa associazione.",
      );
    }

    const requesterRole = String(
      requesterMembership.role,
    )
      .trim()
      .toUpperCase();

    if (
      requesterRole !== "OWNER" &&
      requesterRole !== "ADMIN"
    ) {
      throw new ForbiddenException(
        "Non hai il permesso di reinviare questo invito.",
      );
    }

    const token = randomUUID();

    const updated =
      await this.prisma.invitation.update({
        where: {
          id: invitationId,
        },
        data: {
          token,
          status: "PENDING",
          acceptedAt: null,
          expiresAt: new Date(
            Date.now() +
              7 * 24 * 60 * 60 * 1000,
          ),
        },
        include: {
          association: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: invitation.email,
        },
        select: {
          id: true,
        },
      });

    if (
      existingUser &&
      existingUser.id !== userId
    ) {
      await this.notify(
        existingUser.id,
        invitation.associationId,
        "Invito nuovamente disponibile",
        `L'invito a partecipare all'associazione "${updated.association?.name ?? "associazione"}" è stato rinnovato.`,
      );
    }

    return updated;
  }
  async removeInvitation(
    invitationId: string,
    userId: string,
  ) {
    if (!invitationId) {
      throw new BadRequestException(
        "ID invito mancante.",
      );
    }

    if (!userId) {
      throw new BadRequestException(
        "Utente non valido.",
      );
    }

    const invitation =
      await this.prisma.invitation.findUnique({
        where: {
          id: invitationId,
        },
      });

    if (!invitation) {
      throw new NotFoundException(
        "Invito non trovato.",
      );
    }

    const requesterMembership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId:
            invitation.associationId,
        },
      });

    if (!requesterMembership) {
      throw new ForbiddenException(
        "Non appartieni a questa associazione.",
      );
    }

    const requesterRole = String(
      requesterMembership.role,
    )
      .trim()
      .toUpperCase();

    if (
      requesterRole !== "OWNER" &&
      requesterRole !== "ADMIN"
    ) {
      throw new ForbiddenException(
        "Non hai il permesso di eliminare questo invito.",
      );
    }

    await this.prisma.invitation.delete({
      where: {
        id: invitationId,
      },
    });

    return {
      success: true,
      id: invitationId,
    };
  }
}


