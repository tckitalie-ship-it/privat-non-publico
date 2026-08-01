import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifica che l’utente sia super-admin
   */
  ensureSuperAdmin(user: any) {
    if (user.role !== "ADMIN") {
      throw new ForbiddenException("Permessi insufficienti");
    }
  }

  /**
   * Panoramica globale del sistema
   */
  async getOverview() {
    const [users, associations, events, finances] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.association.count(),
      this.prisma.event.count(),
      this.prisma.transaction.count(), // ✅ CORRETTO
    ]);

    return { users, associations, events, finances };
  }

  /**
   * Lista utenti
   */
  async listUsers() {
    return this.prisma.user.findMany({
      include: {
        memberships: {
          include: { association: true },
        },
      },
    });
  }

  /**
   * Aggiorna email utente
   */
  async updateUser(id: string, dto: { email?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("Utente non trovato");
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email ?? user.email,
      },
    });
  }

  /**
   * Elimina utente
   */
  async deleteUser(id: string) {
    await this.prisma.membership.deleteMany({ where: { userId: id } });
    await this.prisma.invitation.deleteMany({ where: { invitedById: id } });

    await this.prisma.user.delete({ where: { id } });

    return { message: "Utente eliminato" };
  }

  /**
   * Lista associazioni
   */
  async listAssociations() {
    return this.prisma.association.findMany({
      include: {
        memberships: true,
      },
    });
  }

  /**
   * Aggiorna associazione
   */
  async updateAssociation(
    id: string,
    dto: { name?: string; isActive?: boolean }
  ) {
    const association = await this.prisma.association.findUnique({
      where: { id },
    });

    if (!association) {
      throw new NotFoundException("Associazione non trovata");
    }

    return this.prisma.association.update({
      where: { id },
      data: {
        name: dto.name ?? association.name,
        isActive: dto.isActive ?? association.isActive,
      },
    });
  }

  /**
   * Elimina associazione
   */
  async deleteAssociation(id: string) {
    await this.prisma.membership.deleteMany({ where: { associationId: id } });
    await this.prisma.event.deleteMany({ where: { associationId: id } });
    await this.prisma.transaction.deleteMany({ where: { associationId: id } }); // ✅ CORRETTO
    await this.prisma.file.deleteMany({ where: { associationId: id } });

    await this.prisma.association.delete({ where: { id } });

    return { message: "Associazione eliminata" };
  }

  /**
   * Aggiorna ruolo utente in un’associazione
   */
  async updateRole(membershipId: string, role: Role) {
    const membership = await this.prisma.membership.findUnique({
      where: { id: membershipId },
    });

    if (!membership) {
      throw new NotFoundException("Membership non trovata");
    }

    return this.prisma.membership.update({
      where: { id: membershipId },
      data: { role },
    });
  }
}
