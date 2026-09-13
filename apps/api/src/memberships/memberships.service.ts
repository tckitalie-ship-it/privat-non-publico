import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { NotificationsGateway } from "../notifications/notifications.gateway";

import { toMembershipDto } from "./memberships.mapper";

@Injectable()
export class MembershipsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Recupera l'associazione attiva.
   * Se non Ã¨ presente, usa la prima membership dell'utente.
   */
  private async resolveAssociationId(
    userId: string,
    associationId?: string | null,
  ): Promise<string> {
    if (associationId) {
      const membership =
        await this.prisma.membership.findFirst({
          where: {
            userId,
            associationId,
          },
          select: {
            associationId: true,
          },
        });

      if (membership) {
        return membership.associationId;
      }
    }

    const firstMembership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          associationId: true,
        },
      });

    if (!firstMembership) {
      throw new NotFoundException(
        "Nessuna associazione collegata all'utente",
      );
    }

    return firstMembership.associationId;
  }

  /**
   * Controlla che l'utente sia Owner o Admin
   * nell'associazione indicata.
   */
  private async ensureCanManageMembers(
    userId: string,
    associationId: string,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Non appartieni a questa associazione",
      );
    }

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        "Non hai i permessi per gestire i membri",
      );
    }

    return membership;
  }

  /**
   * Crea una notifica privata associata a una specifica associazione.
   *
   * Usiamo direttamente Prisma perchÃ© questo metodo viene usato
   * anche durante la rimozione di una membership: in quel momento
   * l'utente non appartiene piÃ¹ all'associazione e il normale
   * NotificationsService potrebbe rifiutare la notifica.
   */
  private async notifyUser(
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

  /**
   * Recupera il nome dell'associazione.
   */
  private async getAssociationName(
    associationId: string,
  ): Promise<string> {
    const association =
      await this.prisma.association.findUnique({
        where: {
          id: associationId,
        },
        select: {
          name: true,
        },
      });

    return association?.name ?? "associazione";
  }

  /**
   * Elenco membri dell'associazione attiva.
   */
  async findAllForUser(
    userId: string,
    associationId?: string | null,
  ) {
    const resolvedAssociationId =
      await this.resolveAssociationId(
        userId,
        associationId,
      );

    const memberships =
      await this.prisma.membership.findMany({
        where: {
          associationId: resolvedAssociationId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return memberships.map(toMembershipDto);
  }

  /**
   * Membership dell'utente autenticato.
   */
  async me(
    userId: string,
    associationId?: string | null,
  ) {
    const resolvedAssociationId =
      await this.resolveAssociationId(
        userId,
        associationId,
      );

    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId: resolvedAssociationId,
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

    if (!membership) {
      throw new NotFoundException(
        "Membership non trovata",
      );
    }

    return membership;
  }

  /**
   * Aggiorna il ruolo di un membro.
   *
   * Dopo la modifica viene inviata una notifica privata
   * al membro interessato, con associazione e vecchio/nuovo ruolo.
   */
  async updateRole(
    membershipId: string,
    role: string,
    currentUserId: string,
  ) {
    if (!Object.values(Role).includes(role as Role)) {
      throw new BadRequestException(
        "Ruolo non valido",
      );
    }

    const target =
      await this.prisma.membership.findUnique({
        where: {
          id: membershipId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

    if (!target) {
      throw new NotFoundException(
        "Membro non trovato",
      );
    }

    const requester =
      await this.ensureCanManageMembers(
        currentUserId,
        target.associationId,
      );

    /*
     * Un ADMIN puÃ² gestire i membri,
     * ma non puÃ² assegnare il ruolo OWNER.
     *
     * Solo un OWNER puÃ² creare/promuovere
     * un altro OWNER.
     */
    if (
      role === Role.OWNER &&
      requester.role !== Role.OWNER
    ) {
      throw new ForbiddenException(
        "Solo il proprietario puÃ² assegnare il ruolo OWNER",
      );
    }

    /*
     * Nessuno puÃ² modificare la propria membership.
     */
    if (target.userId === currentUserId) {
      throw new BadRequestException(
        "Non puoi modificare il tuo ruolo",
      );
    }

    /*
     * Un ADMIN non puÃ² modificare un OWNER.
     */
    if (
      requester.role === Role.ADMIN &&
      target.role === Role.OWNER
    ) {
      throw new ForbiddenException(
        "Un ADMIN non puÃ² modificare il ruolo del proprietario",
      );
    }

    const newRole = role as Role;
    const oldRole = target.role;

    /*
     * Se il ruolo Ã¨ giÃ  quello richiesto,
     * non eseguiamo update e non generiamo notifiche.
     */
    if (oldRole === newRole) {
      return toMembershipDto(target);
    }

    const updated =
      await this.prisma.membership.update({
        where: {
          id: membershipId,
        },
        data: {
          role: newRole,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

    const associationName =
      await this.getAssociationName(
        target.associationId,
      );

    await this.notifyUser(
      target.userId,
      target.associationId,
      "Ruolo aggiornato",
      `Il tuo ruolo nell'associazione "${associationName}" Ã¨ stato modificato da ${oldRole} a ${newRole}.`,
    );

    return toMembershipDto(updated);
  }

  /**
   * Rimuove un membro.
   *
   * La notifica viene creata prima della cancellazione della membership,
   * cosÃ¬ il messaggio resta correttamente associato all'associazione.
   */
  async remove(
    membershipId: string,
    currentUserId: string,
  ) {
    const target =
      await this.prisma.membership.findUnique({
        where: {
          id: membershipId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

    if (!target) {
      throw new NotFoundException(
        "Membro non trovato",
      );
    }

    const requester =
      await this.ensureCanManageMembers(
        currentUserId,
        target.associationId,
      );

    if (target.userId === currentUserId) {
      throw new BadRequestException(
        "Non puoi rimuovere la tua membership",
      );
    }

    /*
     * Un ADMIN non puÃ² rimuovere un OWNER.
     * Manteniamo la stessa protezione usata per la modifica ruolo.
     */
    if (
      requester.role === Role.ADMIN &&
      target.role === Role.OWNER
    ) {
      throw new ForbiddenException(
        "Un ADMIN non puÃ² rimuovere il proprietario",
      );
    }

    const associationName =
      await this.getAssociationName(
        target.associationId,
      );

    await this.notifyUser(
      target.userId,
      target.associationId,
      "Membro rimosso",
      `Sei stato rimosso dall'associazione "${associationName}".`,
    );

    await this.prisma.membership.delete({
      where: {
        id: membershipId,
      },
    });

    return {
      success: true,
      message: "Membro rimosso",
    };
  }
  async availableUsers(
    currentUserId: string,
    associationId?: string,
  ) {
    const resolvedAssociationId = await this.resolveAssociationId(
      currentUserId,
      associationId,
    );

    await this.ensureCanManageMembers(
      currentUserId,
      resolvedAssociationId,
    );

    const memberships = await this.prisma.membership.findMany({
      where: {
        associationId: resolvedAssociationId,
      },
      select: {
        userId: true,
      },
    });

    const memberUserIds = memberships.map(
      (membership) => membership.userId,
    );

    return this.prisma.user.findMany({
      where: {
        id: {
          notIn: memberUserIds,
        },
      },
      select: {
        id: true,
        email: true,
      },
      orderBy: {
        email: "asc",
      },
    });
  }
  async create(
    dto: {
      userId: string;
      associationId?: string;
      firstName: string;
      lastName: string;
      birthDate?: string;
      address?: string;
      phone?: string;
      memberNumber?: number;
    },
    currentUserId: string,
  ) {
    console.log("[membership create] DTO ricevuto:", JSON.stringify(dto));
    if (!dto.firstName?.trim() || !dto.lastName?.trim()) {
      throw new BadRequestException("Nome e cognome sono obbligatori");
    }

    const associationId = await this.resolveAssociationId(
      currentUserId,
      dto.associationId,
    );

    await this.ensureCanManageMembers(currentUserId, associationId);

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException("Utente non trovato");
    }

    const existing = await this.prisma.membership.findFirst({
      where: {
        userId: dto.userId,
        associationId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        "L'utente è già membro di questa associazione",
      );
    }

    let memberNumber = dto.memberNumber;

    if (memberNumber == null) {
      const lastMember = await this.prisma.membership.findFirst({
        where: {
          associationId,
          memberNumber: { not: null },
        },
        orderBy: { memberNumber: "desc" },
      });

      memberNumber = (lastMember?.memberNumber ?? 0) + 1;
    }

    const duplicateNumber = await this.prisma.membership.findFirst({
      where: {
        associationId,
        memberNumber,
      },
    });

    if (duplicateNumber) {
      throw new BadRequestException(
        "Il numero carta membro è già utilizzato",
      );
    }

    const birthDate = dto.birthDate
      ? new Date(dto.birthDate)
      : undefined;

    if (birthDate && Number.isNaN(birthDate.getTime())) {
      throw new BadRequestException("Data di nascita non valida");
    }

    const membership = await this.prisma.membership.create({
      data: {
        userId: dto.userId,
        associationId,
        role: Role.MEMBER,
        memberNumber,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        birthDate,
        address: dto.address?.trim() || null,
        phone: dto.phone?.trim() || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return toMembershipDto(membership);
  }

  async update(
    membershipId: string,
    dto: {
      firstName?: string;
      lastName?: string;
      birthDate?: string;
      address?: string;
      phone?: string;
      memberNumber?: number;
    },
    currentUserId: string,
  ) {
    const target = await this.prisma.membership.findUnique({
      where: { id: membershipId },
    });

    if (!target) {
      throw new NotFoundException("Membro non trovato");
    }

    await this.ensureCanManageMembers(
      currentUserId,
      target.associationId,
    );

    if (dto.memberNumber !== undefined) {
      const duplicate = await this.prisma.membership.findFirst({
        where: {
          associationId: target.associationId,
          memberNumber: dto.memberNumber,
          NOT: { id: membershipId },
        },
      });

      if (duplicate) {
        throw new BadRequestException(
          "Il numero carta membro è già utilizzato",
        );
      }
    }

    const birthDate =
      dto.birthDate !== undefined
        ? new Date(dto.birthDate)
        : undefined;

    if (birthDate && Number.isNaN(birthDate.getTime())) {
      throw new BadRequestException("Data di nascita non valida");
    }

    const data: any = {};

    if (dto.firstName !== undefined) {
      if (!dto.firstName.trim()) {
        throw new BadRequestException("Il nome è obbligatorio");
      }
      data.firstName = dto.firstName.trim();
    }

    if (dto.lastName !== undefined) {
      if (!dto.lastName.trim()) {
        throw new BadRequestException("Il cognome è obbligatorio");
      }
      data.lastName = dto.lastName.trim();
    }

    if (dto.birthDate !== undefined) data.birthDate = birthDate;
    if (dto.address !== undefined) data.address = dto.address.trim() || null;
    if (dto.phone !== undefined) data.phone = dto.phone.trim() || null;
    if (dto.memberNumber !== undefined) {
      data.memberNumber = dto.memberNumber;
    }

    const updated = await this.prisma.membership.update({
      where: { id: membershipId },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return toMembershipDto(updated);
  }
}
