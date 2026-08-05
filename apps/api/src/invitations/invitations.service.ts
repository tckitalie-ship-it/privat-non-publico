import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, Role } from "@prisma/client";
import * as argon2 from "argon2";
import * as crypto from "crypto";

import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Verifica che l’utente appartenga all’associazione.
   */
  private async ensureMembership(
    userId: string,
    associationId: string,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId,
        },
        select: {
          id: true,
          role: true,
          associationId: true,
          userId: true,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Non sei membro di questa associazione",
      );
    }

    return membership;
  }

  /**
   * Calcola il numero successivo della tessera
   * usando il client Prisma ricevuto.
   *
   * Può essere utilizzato sia con PrismaService
   * sia all’interno di una transazione.
   */
  private async getNextMemberNumber(
    prismaClient:
      | PrismaService
      | Prisma.TransactionClient,
    associationId: string,
  ): Promise<number> {
    const lastMembership =
      await prismaClient.membership.findFirst({
        where: {
          associationId,
          memberNumber: {
            not: null,
          },
        },
        orderBy: {
          memberNumber: "desc",
        },
        select: {
          memberNumber: true,
        },
      });

    return (lastMembership?.memberNumber ?? 0) + 1;
  }

  /**
   * Restituisce tutti gli inviti delle associazioni
   * dell’utente autenticato.
   */
  async findAll(userId: string) {
    const memberships =
      await this.prisma.membership.findMany({
        where: {
          userId,
        },
        select: {
          associationId: true,
        },
      });

    const associationIds = memberships.map(
      (membership) => membership.associationId,
    );

    if (associationIds.length === 0) {
      return [];
    }

    return this.prisma.invitation.findMany({
      where: {
        associationId: {
          in: associationIds,
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
        associationId: true,
        association: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Crea un invito e restituisce:
   * - i dati essenziali dell’invito;
   * - il link di accettazione;
   * - lo stato dell’invio email.
   */
  async createInvitation(
    userId: string,
    dto: {
      email: string;
      role: Role;
      associationId: string;
    },
  ) {
    const membership = await this.ensureMembership(
      userId,
      dto.associationId,
    );

    if (membership.role === Role.MEMBER) {
      throw new ForbiddenException(
        "Non hai i permessi per invitare membri",
      );
    }

    const normalizedEmail = dto.email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      throw new BadRequestException(
        "L’indirizzo email è obbligatorio",
      );
    }

    const existingPending =
      await this.prisma.invitation.findFirst({
        where: {
          email: normalizedEmail,
          associationId: dto.associationId,
          status: "PENDING",
        },
        select: {
          id: true,
        },
      });

    if (existingPending) {
      throw new BadRequestException(
        "Esiste già un invito pendente per questa email",
      );
    }

    const alreadyMember =
      await this.prisma.membership.findFirst({
        where: {
          associationId: dto.associationId,
          user: {
            email: normalizedEmail,
          },
        },
        select: {
          id: true,
        },
      });

    if (alreadyMember) {
      throw new BadRequestException(
        "Questa persona è già membro dell’associazione",
      );
    }

    const token = crypto
      .randomBytes(32)
      .toString("hex");

    const invitation =
      await this.prisma.invitation.create({
        data: {
          email: normalizedEmail,
          role: dto.role,
          token,
          associationId: dto.associationId,
          invitedById: userId,
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ),
          status: "PENDING",
        },
        include: {
          association: {
            select: {
              name: true,
            },
          },
        },
      });

    const frontendUrl =
      this.configService.get<string>("FRONTEND_URL") ??
      "http://localhost:3000";

    const invitationUrl =
      `${frontendUrl.replace(/\/$/, "")}` +
      `/invite/accept?token=${encodeURIComponent(
        invitation.token,
      )}`;

    let emailSent = true;

    try {
       await this.mailService.sendInvitationEmail({
  to: invitation.email,
  inviteUrl: invitationUrl,
  associationName: invitation.association.name,
});
    } catch (error) {
      emailSent = false;

      console.error(
        "Errore durante l’invio dell’email di invito:",
        error,
      );
    }

    return {
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        associationId: invitation.associationId,
        associationName: invitation.association.name,
      },
      invitationUrl,
      emailSent,
    };
  }

  /**
   * Rimuove un invito.
   */
  async removeInvitation(
    id: string,
    userId: string,
  ) {
    const invitation =
      await this.prisma.invitation.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          associationId: true,
        },
      });

    if (!invitation) {
      throw new NotFoundException(
        "Invito non trovato",
      );
    }

    const membership = await this.ensureMembership(
      userId,
      invitation.associationId,
    );

    if (membership.role === Role.MEMBER) {
      throw new ForbiddenException(
        "Non hai i permessi per eliminare inviti",
      );
    }

    await this.prisma.invitation.delete({
      where: {
        id: invitation.id,
      },
    });

    return {
      message: "Invito eliminato",
    };
  }

  /**
   * Verifica che il token corrisponda
   * a un invito pendente e non scaduto.
   */
  async checkToken(token: string) {
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      throw new BadRequestException(
        "Token dell’invito obbligatorio",
      );
    }

    const invitation =
      await this.prisma.invitation.findUnique({
        where: {
          token: normalizedToken,
        },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          expiresAt: true,
          acceptedAt: true,
          associationId: true,
          association: {
            select: {
              name: true,
            },
          },
        },
      });

    if (!invitation) {
      throw new NotFoundException(
        "Invito non valido",
      );
    }

    if (invitation.status === "ACCEPTED") {
      throw new BadRequestException(
        "Invito già accettato",
      );
    }

    if (invitation.status !== "PENDING") {
      throw new BadRequestException(
        "Invito non più utilizzabile",
      );
    }

    if (
      !invitation.expiresAt ||
      invitation.expiresAt <= new Date()
    ) {
      throw new BadRequestException(
        "Invito scaduto",
      );
    }

    return invitation;
  }

  /**
   * Accetta l’invito per un utente già registrato.
   */
  async acceptInvitation(
    token: string,
    userId: string,
  ) {
    const invitation =
      await this.checkToken(token);

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
        "Utente non trovato",
      );
    }

    const normalizedUserEmail = user.email
      .trim()
      .toLowerCase();

    const normalizedInvitationEmail =
      invitation.email.trim().toLowerCase();

    if (
      normalizedUserEmail !==
      normalizedInvitationEmail
    ) {
      throw new ForbiddenException(
        "Questo invito appartiene a un’altra email",
      );
    }

    const existingMembership =
      await this.prisma.membership.findFirst({
        where: {
          userId: user.id,
          associationId:
            invitation.associationId,
        },
        select: {
          id: true,
        },
      });

    if (existingMembership) {
      throw new BadRequestException(
        "Sei già membro di questa associazione",
      );
    }

    const membership =
      await this.prisma.$transaction(
        async (transaction) => {
          const currentInvitation =
            await transaction.invitation.findUnique({
              where: {
                id: invitation.id,
              },
              select: {
                status: true,
                expiresAt: true,
              },
            });

          if (!currentInvitation) {
            throw new NotFoundException(
              "Invito non trovato",
            );
          }

          if (currentInvitation.status !== "PENDING") {
            throw new BadRequestException(
              "Invito già utilizzato",
            );
          }

          if (
            !currentInvitation.expiresAt ||
            currentInvitation.expiresAt <= new Date()
          ) {
            throw new BadRequestException(
              "Invito scaduto",
            );
          }

          const existingMembershipInTransaction =
            await transaction.membership.findFirst({
              where: {
                userId: user.id,
                associationId:
                  invitation.associationId,
              },
              select: {
                id: true,
              },
            });

          if (existingMembershipInTransaction) {
            throw new BadRequestException(
              "Sei già membro di questa associazione",
            );
          }

          const memberNumber =
            await this.getNextMemberNumber(
              transaction,
              invitation.associationId,
            );

          const createdMembership =
            await transaction.membership.create({
              data: {
                userId: user.id,
                associationId:
                  invitation.associationId,
                role: invitation.role,
                memberNumber,
              },
            });

          await transaction.invitation.update({
            where: {
              id: invitation.id,
            },
            data: {
              acceptedAt: new Date(),
              status: "ACCEPTED",
            },
          });

          return createdMembership;
        },
      );

    return {
      message: "Invito accettato",
      membership,
    };
  }

  /**
   * Accetta l’invito e registra un nuovo utente.
   *
   * La password ricevuta è in chiaro e viene
   * hashata nel backend prima del salvataggio.
   */
  async acceptAndRegister(dto: {
    token: string;
    email: string;
    password: string;
  }) {
    const invitation =
      await this.checkToken(dto.token);

    const normalizedEmail = dto.email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      throw new BadRequestException(
        "L’indirizzo email è obbligatorio",
      );
    }

    if (!dto.password) {
      throw new BadRequestException(
        "La password è obbligatoria",
      );
    }

    if (dto.password.length < 8) {
      throw new BadRequestException(
        "La password deve contenere almeno 8 caratteri",
      );
    }

    const normalizedInvitationEmail =
      invitation.email.trim().toLowerCase();

    if (
      normalizedInvitationEmail !==
      normalizedEmail
    ) {
      throw new BadRequestException(
        "Email non corrispondente all’invito",
      );
    }

    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
        select: {
          id: true,
        },
      });

    if (existingUser) {
      throw new BadRequestException(
        "Utente già registrato, usa l’accettazione normale",
      );
    }

    const passwordHash = await argon2.hash(
      dto.password,
    );

    const result =
      await this.prisma.$transaction(
        async (transaction) => {
          const currentInvitation =
            await transaction.invitation.findUnique({
              where: {
                id: invitation.id,
              },
              select: {
                status: true,
                expiresAt: true,
              },
            });

          if (!currentInvitation) {
            throw new NotFoundException(
              "Invito non trovato",
            );
          }

          if (currentInvitation.status !== "PENDING") {
            throw new BadRequestException(
              "Invito già utilizzato",
            );
          }

          if (
            !currentInvitation.expiresAt ||
            currentInvitation.expiresAt <= new Date()
          ) {
            throw new BadRequestException(
              "Invito scaduto",
            );
          }

          const user =
            await transaction.user.create({
              data: {
                email: normalizedEmail,
                passwordHash,
              },
              select: {
                id: true,
                email: true,
                createdAt: true,
              },
            });

          const memberNumber =
            await this.getNextMemberNumber(
              transaction,
              invitation.associationId,
            );

          const membership =
            await transaction.membership.create({
              data: {
                userId: user.id,
                associationId:
                  invitation.associationId,
                role: invitation.role,
                memberNumber,
              },
            });

          await transaction.invitation.update({
            where: {
              id: invitation.id,
            },
            data: {
              acceptedAt: new Date(),
              status: "ACCEPTED",
            },
          });

          return {
            user,
            membership,
          };
        },
      );

    return {
      message:
        "Registrazione completata e invito accettato",
      user: result.user,
      membership: result.membership,
    };
  }
}