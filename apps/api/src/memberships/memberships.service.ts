import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { toMembershipDto } from "./memberships.mapper";

@Injectable()
export class MembershipsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Recupera l'associazione attiva.
   * Se non è presente nel JWT, usa la prima membership.
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
   * Un ADMIN può gestire i membri,
   * ma non può assegnare il ruolo OWNER.
   *
   * Solo un OWNER può creare/promuovere
   * un altro OWNER.
   */
  if (
    role === Role.OWNER &&
    requester.role !== Role.OWNER
  ) {
    throw new ForbiddenException(
      "Solo il proprietario può assegnare il ruolo OWNER",
    );
  }

  /*
   * Nessuno può modificare la propria membership.
   */
  if (target.userId === currentUserId) {
    throw new BadRequestException(
      "Non puoi modificare il tuo ruolo",
    );
  }

  /*
   * Un ADMIN non può modificare un OWNER.
   */
  if (
    requester.role === Role.ADMIN &&
    target.role === Role.OWNER
  ) {
    throw new ForbiddenException(
      "Un ADMIN non può modificare il ruolo del proprietario",
    );
  }

  const updated =
    await this.prisma.membership.update({
      where: {
        id: membershipId,
      },
      data: {
        role: role as Role,
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

  return toMembershipDto(updated);
}

  /**
   * Rimuove un membro.
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
      });

    if (!target) {
      throw new NotFoundException(
        "Membro non trovato",
      );
    }

    await this.ensureCanManageMembers(
      currentUserId,
      target.associationId,
    );

    if (target.userId === currentUserId) {
      throw new BadRequestException(
        "Non puoi rimuovere la tua membership",
      );
    }

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
}