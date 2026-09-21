import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { CreateAssociationDto } from "../associations/dto/create-association.dto";
import { UpdateAssociationDto } from "../associations/dto/update-association.dto";

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllAssociations() {
    return this.prisma.association.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            memberships: true,
            events: true,
            files: true,
          },
        },
      },
    });
  }

  async createAssociation(
    dto: CreateAssociationDto,
    platformOwnerUserId: string,
  ) {
    const name = dto.name.trim();
    const description = dto.description?.trim() ?? "";

    if (name.length < 2) {
      throw new BadRequestException(
        "Il nome dell'associazione deve contenere almeno 2 caratteri",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      return tx.association.create({
        data: {
          name,
          description,
          memberships: {
            create: {
              userId: platformOwnerUserId,
              role: Role.OWNER,
            },
          },
        },
        include: {
          memberships: true,
          events: true,
        },
      });
    });
  }

  async findAssociation(id: string) {
    const association = await this.prisma.association.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            memberships: true,
            events: true,
            files: true,
            reminders: true,
            notifications: true,
            transactions: true,
          },
        },
      },
    });

    if (!association) {
      throw new NotFoundException("Associazione non trovata");
    }

    return association;
  }

  async findAssociationMembers(id: string) {
    const association = await this.prisma.association.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!association) {
      throw new NotFoundException("Associazione non trovata");
    }

    return this.prisma.membership.findMany({
      where: { associationId: id },
      select: {
        id: true,
        userId: true,
        memberNumber: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: [
        { role: "asc" },
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });
  }

  async findAssociationMember(id: string, membershipId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        id: membershipId,
        associationId: id,
      },
      select: {
        id: true,
        userId: true,
        memberNumber: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        address: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException("Membro non trovato");
    }

    return membership;
  }

  async updateAssociationMember(
    associationId: string,
    membershipId: string,
    dto: {
      firstName?: string;
      lastName?: string;
      memberNumber?: number | null;
      birthDate?: string | null;
      address?: string | null;
      phone?: string | null;
      role?: string;
    },
  ) {
    const target = await this.prisma.membership.findFirst({
      where: {
        id: membershipId,
        associationId,
      },
      select: {
        id: true,
        memberNumber: true,
      },
    });

    if (!target) {
      throw new NotFoundException("Membro non trovato");
    }

    const data: Prisma.MembershipUpdateInput = {};

    if (dto.firstName !== undefined) {
      const firstName = dto.firstName.trim();
      if (!firstName) {
        throw new BadRequestException("Il nome è obbligatorio");
      }
      data.firstName = firstName;
    }

    if (dto.lastName !== undefined) {
      const lastName = dto.lastName.trim();
      if (!lastName) {
        throw new BadRequestException("Il cognome è obbligatorio");
      }
      data.lastName = lastName;
    }

    if (dto.memberNumber !== undefined) {
      if (dto.memberNumber === null) {
        data.memberNumber = null;
      } else {
        if (
          !Number.isInteger(dto.memberNumber) ||
          dto.memberNumber < 1
        ) {
          throw new BadRequestException(
            "Il numero membro deve essere un intero positivo",
          );
        }

        const duplicate = await this.prisma.membership.findFirst({
          where: {
            associationId,
            memberNumber: dto.memberNumber,
            id: { not: membershipId },
          },
          select: { id: true },
        });

        if (duplicate) {
          throw new BadRequestException(
            "Il numero membro è già utilizzato da un altro membro dell'associazione",
          );
        }

        data.memberNumber = dto.memberNumber;
      }
    }

    if (dto.birthDate !== undefined) {
      if (dto.birthDate === null || dto.birthDate.trim() === "") {
        data.birthDate = null;
      } else {
        const birthDate = new Date(dto.birthDate);
        if (Number.isNaN(birthDate.getTime())) {
          throw new BadRequestException("Data di nascita non valida");
        }
        data.birthDate = birthDate;
      }
    }

    if (dto.address !== undefined) {
      data.address = dto.address?.trim() || null;
    }

    if (dto.phone !== undefined) {
      data.phone = dto.phone?.trim() || null;
    }

    if (dto.role !== undefined) {
      if (!Object.values(Role).includes(dto.role as Role)) {
        throw new BadRequestException("Ruolo non valido");
      }
      data.role = dto.role as Role;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException("Nessuna modifica da salvare");
    }

    try {
      return await this.prisma.membership.update({
        where: { id: membershipId },
        data,
        select: {
          id: true,
          userId: true,
          memberNumber: true,
          firstName: true,
          lastName: true,
          birthDate: true,
          address: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("Membro non trovato");
      }

      throw error;
    }
  }

  async updateAssociation(
    id: string,
    dto: UpdateAssociationDto,
  ) {
    const existing = await this.prisma.association.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException("Associazione non trovata");
    }

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
          _count: {
            select: {
              memberships: true,
              events: true,
              files: true,
              reminders: true,
              notifications: true,
              transactions: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException(
          "Lo slug è già utilizzato da un'altra associazione",
        );
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException("Associazione non trovata");
      }

      throw error;
    }
  }
  async setAssociationStatus(id: string, isActive: boolean) {
    const association = await this.prisma.association.findUnique({
      where: { id },
    });

    if (!association) {
      throw new NotFoundException("Associazione non trovata");
    }

    return this.prisma.association.update({
      where: { id },
      data: { isActive },
    });
  }
}
