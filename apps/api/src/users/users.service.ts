import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Trova utente per ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            association: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("Utente non trovato");
    }

    return user;
  }

  /**
   * Trova utente per email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        memberships: true,
      },
    });
  }

  /**
   * Associazioni dell’utente
   */
  async getUserAssociations(userId: string) {
    return this.prisma.membership.findMany({
      where: { userId },
      include: {
        association: true,
      },
    });
  }

  /**
   * Aggiorna dati utente
   */
  async updateUser(userId: string, dto: { email?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Utente non trovato");
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        email: dto.email ?? user.email,
      },
    });
  }

  /**
   * Verifica membership
   */
  async ensureMembership(userId: string, associationId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, associationId },
    });

    if (!membership) {
      throw new ForbiddenException("Non appartieni a questa associazione");
    }

    return membership;
  }

  /**
   * Aggiorna ruolo utente in un’associazione
   */
  async updateRole(
    adminId: string,
    userId: string,
    associationId: string,
    role: Role
  ) {
    const adminMembership = await this.ensureMembership(adminId, associationId);

    if (adminMembership.role === Role.MEMBER) {
      throw new ForbiddenException("Non hai i permessi per aggiornare ruoli");
    }

    const membership = await this.prisma.membership.findFirst({
      where: { userId, associationId },
    });

    if (!membership) {
      throw new NotFoundException("Membership non trovata");
    }

    return this.prisma.membership.update({
      where: { id: membership.id },
      data: { role },
    });
  }

  /**
   * Rimuove utente da un’associazione
   */
  async removeFromAssociation(
    adminId: string,
    userId: string,
    associationId: string
  ) {
    const adminMembership = await this.ensureMembership(adminId, associationId);

    if (adminMembership.role === Role.MEMBER) {
      throw new ForbiddenException("Non hai i permessi per rimuovere membri");
    }

    const membership = await this.prisma.membership.findFirst({
      where: { userId, associationId },
    });

    if (!membership) {
      throw new NotFoundException("Membership non trovata");
    }

    await this.prisma.membership.delete({
      where: { id: membership.id },
    });

    return { message: "Utente rimosso dall’associazione" };
  }

  /**
   * Ricerca utenti (globale)
   */
  async search(query: string) {
    return this.prisma.user.findMany({
      where: {
        email: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }
}
