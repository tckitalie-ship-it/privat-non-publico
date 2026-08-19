import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";

@Injectable()
export class AssociationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Restituisce tutte le associazioni
   * di cui l'utente è membro.
   */
  async findAllForUser(userId: string) {
    return this.prisma.association.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
      include: {
        memberships: true,
        events: true,
      },
    });
  }

  /**
   * Restituisce una singola associazione
   * solo se l'utente ne fa parte.
   */
  async findOneForUser(
    id: string,
    userId: string,
  ) {
    const association =
      await this.prisma.association.findUnique({
        where: {
          id,
        },
        include: {
          memberships: true,
          events: true,
        },
      });

    if (!association) {
      throw new NotFoundException(
        "Associazione non trovata",
      );
    }

    const isMember =
      association.memberships.some(
        (membership) =>
          membership.userId === userId,
      );

    if (!isMember) {
      throw new ForbiddenException(
        "Accesso negato",
      );
    }

    return association;
  }

  /**
   * Crea una nuova associazione.
   *
   * L'utente che la crea diventa OWNER.
   */
  async create(
    dto: CreateAssociationDto,
    userId: string,
  ) {
    return this.prisma.association.create({
      data: {
        name: dto.name,
        description: dto.description ?? "",

        memberships: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
      },
      include: {
        memberships: true,
        events: true,
      },
    });
  }

  /**
   * Modifica i dati dell'associazione.
   *
   * SOLO OWNER.
   */
  async update(
    id: string,
    dto: UpdateAssociationDto,
    userId: string,
  ) {
    await this.ensureOwner(
      id,
      userId,
    );

    return this.prisma.association.update({
      where: {
        id,
      },
      data: dto,
      include: {
        memberships: true,
        events: true,
      },
    });
  }

  /**
   * Elimina definitivamente l'associazione.
   *
   * SOLO OWNER.
   */
  async remove(
    id: string,
    userId: string,
  ) {
    await this.ensureOwner(
      id,
      userId,
    );

    return this.prisma.association.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Verifica che l'utente sia membro
   * dell'associazione.
   */
  private async ensureMembership(
    id: string,
    userId: string,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          associationId: id,
          userId,
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
   * Verifica che l'utente sia OWNER.
   *
   * Le impostazioni principali
   * dell'associazione sono riservate
   * al proprietario.
   */
  private async ensureOwner(
    id: string,
    userId: string,
  ) {
    const membership =
      await this.ensureMembership(
        id,
        userId,
      );

    if (membership.role !== Role.OWNER) {
      throw new ForbiddenException(
        "Solo il proprietario può modificare questa associazione",
      );
    }

    return membership;
  }
}
