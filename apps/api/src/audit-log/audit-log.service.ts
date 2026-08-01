import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra un'azione nel sistema
   */
  async log(entry: {
    actorId?: string;
    associationId?: string;
    action: string;
    category: string;
    details?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        associationId: entry.associationId ?? null,
        action: entry.action,
        category: entry.category,
        details: entry.details
          ? JSON.parse(JSON.stringify(entry.details))
          : {},
      },
    });
  }

  /**
   * Tutti i log di una specifica associazione
   */
  async findAllForAssociation(associationId: string) {
    return this.prisma.auditLog.findMany({
      where: { associationId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Tutti i log generati da un utente
   */
  async findAllForUser(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { actorId: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Ricerca avanzata nei log
   */
  async search(filters: {
    associationId?: string;
    actorId?: string;
    category?: string;
    action?: string;
    from?: Date;
    to?: Date;
  }) {
    return this.prisma.auditLog.findMany({
      where: {
        associationId: filters.associationId,
        actorId: filters.actorId,
        category: filters.category,
        action: filters.action,
        createdAt: {
          gte: filters.from,
          lte: filters.to,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Elimina un log
   */
  async create(entry: {
  actorId?: string;
  associationId?: string;
  action: string;
  category: string;
  details?: any;
}) {
  return this.log(entry);
}
  async remove(id: string) {
    await this.prisma.auditLog.delete({
      where: { id },
    });

    return { success: true };
  }
}
