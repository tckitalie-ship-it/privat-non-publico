import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";

@Injectable()
export class AssociationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    return this.prisma.association.findMany({
      where: {
        memberships: {
          some: { userId },
        },
      },
      include: {
        memberships: true,
        events: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findOneForUser(id: string, userId: string) {
    const association = await this.prisma.association.findUnique({
      where: { id },
      include: {
        memberships: true,
        events: true,
      },
    });

    if (!association) {
      throw new NotFoundException("Associazione non trovata");
    }

    const isMember = association.memberships.some(
      (membership) => membership.userId === userId,
    );

    if (!isMember) {
      throw new ForbiddenException("Accesso negato");
    }

    return association;
  }

  async create(dto: CreateAssociationDto, userId: string) {
    const name = dto.name.trim();
    const description = dto.description?.trim() ?? "";

    if (name.length < 2) {
      throw new BadRequestException(
        "Il nome dell'associazione deve contenere almeno 2 caratteri",
      );
    }

    return this.prisma.association.create({
      data: {
        name,
        description,
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

  async update(
    id: string,
    dto: UpdateAssociationDto,
    userId: string,
  ) {
    await this.ensureManager(id, userId);

    const data: Prisma.AssociationUpdateInput = {};

    if (dto.name !== undefined) {
      const name = dto.name.trim();

      if (name.length < 2) {
        throw new BadRequestException(
          "Il nome dell'associazione deve contenere almeno 2 caratteri",
        );
      }

      data.name = name;
    }

    if (dto.description !== undefined && dto.description !== null) {
      data.description = dto.description.trim();
    }

    if (dto.slug !== undefined && dto.slug !== null) {
      const slug = dto.slug.trim().toLowerCase();

      if (slug.length > 120) {
        throw new BadRequestException(
          "Lo slug non può superare 120 caratteri",
        );
      }

      data.slug = slug || null;
    }

    if (dto.logoUrl !== undefined && dto.logoUrl !== null) {
      const logoUrl = dto.logoUrl.trim();

      if (logoUrl.length > 500) {
        throw new BadRequestException(
          "L'URL del logo non può superare 500 caratteri",
        );
      }

      data.logoUrl = logoUrl || null;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        "Nessuna modifica da salvare",
      );
    }

    try {
      return await this.prisma.association.update({
        where: { id },
        data,
        include: {
          memberships: true,
          events: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("Associazione non trovata");
      }

      throw error;
    }
  }

  async remove(id: string, userId: string) {
    await this.ensureOwner(id, userId);

    try {
      return await this.prisma.association.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("Associazione non trovata");
      }

      throw error;
    }
  }

  private async ensureMembership(id: string, userId: string) {
    const membership = await this.prisma.membership.findFirst({
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

  private async ensureManager(id: string, userId: string) {
    const membership = await this.ensureMembership(id, userId);

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        "Solo OWNER o ADMIN possono modificare questa associazione",
      );
    }

    return membership;
  }

  private async ensureOwner(id: string, userId: string) {
    const membership = await this.ensureMembership(id, userId);

    if (membership.role !== Role.OWNER) {
      throw new ForbiddenException(
        "Solo il proprietario può eliminare questa associazione",
      );
    }

    return membership;
  }
}

