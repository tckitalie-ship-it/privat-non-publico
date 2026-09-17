import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface CreateAuditLogInput {
  action: string;
  category: string;
  details?: unknown;
  userId?: string | null;
  actorId?: string | null;
  associationId?: string | null;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una voce di Audit Log.
   *
   * Questo metodo NON verifica i permessi dell'attore:
   * viene usato anche dall'interceptor globale dopo operazioni
   * giÃ  autorizzate dai rispettivi moduli.
   */
  async create(input: CreateAuditLogInput) {
    const details =
      input.details === undefined || input.details === null
        ? undefined
        : (JSON.parse(JSON.stringify(input.details)) as Prisma.InputJsonValue);

    return this.prisma.auditLog.create({
      data: {
        action: input.action.trim(),
        category: input.category.trim(),
        details,
        userId: input.userId ?? null,
        actorId: input.actorId ?? null,
        associationId: input.associationId ?? null,
      },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        association: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Alias utile per chiamate interne.
   */
  async record(input: CreateAuditLogInput) {
    return this.create(input);
  }

  /**
   * Verifica che l'utente appartenga all'associazione.
   *
   * La consultazione dell'Audit Log Ã¨ disponibile a tutti i membri
   * dell'associazione. Le autorizzazioni sulle singole operazioni
   * restano gestite dai rispettivi moduli.
   */
  async ensureMember(userId: string, associationId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        associationId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        "Non fai parte di questa associazione.",
      );
    }

    if (
      membership.role !== "OWNER" &&
      membership.role !== "ADMIN"
    ) {
      throw new ForbiddenException(
        "Non hai il permesso di visualizzare l'Audit Log.",
      );
    }

    return membership;
  }

  /**
   * Lista Audit Log.
   */
  async findAll(
    userId: string,
    associationId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      action?: string;
      from?: string;
      to?: string;
    },
  ) {
    await this.ensureMember(userId, associationId);

    const page = Math.max(1, Number(options?.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(options?.limit) || 50),
    );

    const where: Prisma.AuditLogWhereInput = {
      associationId,
    };

    if (options?.category?.trim()) {
      where.category = options.category.trim();
    }

    if (options?.action?.trim()) {
      where.action = options.action.trim();
    }

    if (options?.search?.trim()) {
      const search = options.search.trim();

      where.OR = [
        {
          action: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          actor: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    if (options?.from || options?.to) {
      where.createdAt = {};

      if (options.from) {
        const from = new Date(options.from);

        if (!Number.isNaN(from.getTime())) {
          where.createdAt.gte = from;
        }
      }

      if (options.to) {
        const to = new Date(options.to);

        if (!Number.isNaN(to.getTime())) {
          where.createdAt.lte = to;
        }
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          association: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      this.prisma.auditLog.count({
        where,
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Ricerca rapida.
   */
  async search(
    userId: string,
    associationId: string,
    q?: string,
    page = 1,
    limit = 50,
  ) {
    return this.findAll(userId, associationId, {
      search: q,
      page,
      limit,
    });
  }

  /**
   * Singolo evento.
   */
  async findOne(
    userId: string,
    associationId: string,
    id: string,
  ) {
    await this.ensureMember(userId, associationId);

    const item = await this.prisma.auditLog.findFirst({
      where: {
        id,
        associationId,
      },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        association: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException("Evento Audit Log non trovato.");
    }

    return item;
  }

  /**
   * Timeline raggruppata per giorno.
   */
  async timeline(
    userId: string,
    associationId: string,
    options?: {
      page?: number;
      limit?: number;
      category?: string;
      action?: string;
      search?: string;
    },
  ) {
    const result = await this.findAll(userId, associationId, options);

    const groups = new Map<string, typeof result.items>();

    for (const item of result.items) {
      const dateKey = item.createdAt.toISOString().slice(0, 10);

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }

      groups.get(dateKey)!.push(item);
    }

    return {
      ...result,
      timeline: Array.from(groups.entries()).map(
        ([date, items]) => ({
          date,
          items,
        }),
      ),
    };
  }

  /**
   * Categorie presenti nell'associazione.
   */
  async categories(
    userId: string,
    associationId: string,
  ) {
    await this.ensureMember(userId, associationId);

    const rows = await this.prisma.auditLog.findMany({
      where: {
        associationId,
      },
      select: {
        category: true,
      },
      distinct: ["category"],
      orderBy: {
        category: "asc",
      },
    });

    return rows.map((row) => row.category);
  }

  /**
   * Azioni presenti nell'associazione.
   */
  async actions(
    userId: string,
    associationId: string,
  ) {
    await this.ensureMember(userId, associationId);

    const rows = await this.prisma.auditLog.findMany({
      where: {
        associationId,
      },
      select: {
        action: true,
      },
      distinct: ["action"],
      orderBy: {
        action: "asc",
      },
    });

    return rows.map((row) => row.action);
  }

  /**
   * Statistiche Audit Log.
   */
  async summary(
    userId: string,
    associationId: string,
  ) {
    await this.ensureMember(userId, associationId);

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;

    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const baseWhere: Prisma.AuditLogWhereInput = {
      associationId,
    };

    const [
      total,
      today,
      week,
      month,
      recent,
    ] = await Promise.all([
      this.prisma.auditLog.count({
        where: baseWhere,
      }),

      this.prisma.auditLog.count({
        where: {
          ...baseWhere,
          createdAt: {
            gte: startOfToday,
          },
        },
      }),

      this.prisma.auditLog.count({
        where: {
          ...baseWhere,
          createdAt: {
            gte: startOfWeek,
          },
        },
      }),

      this.prisma.auditLog.count({
        where: {
          ...baseWhere,
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),

      this.prisma.auditLog.findMany({
        where: baseWhere,
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      today,
      week,
      month,
      recent,
    };
  }

  /**
   * Risolve l'association associata ad una richiesta HTTP.
   *
   * Serve all'interceptor globale per registrare automaticamente
   * POST/PATCH/PUT/DELETE anche quando associationId non Ã¨ nel body.
   */
  async resolveAssociationIdFromRequest(req: any) {
    const bodyAssociationId =
      req?.body?.associationId ??
      req?.body?.associationID ??
      req?.body?.association_id;

    if (typeof bodyAssociationId === "string" && bodyAssociationId) {
      return bodyAssociationId;
    }

    const headerAssociationId =
      req?.headers?.["x-association-id"];

    if (
      typeof headerAssociationId === "string" &&
      headerAssociationId
    ) {
      return headerAssociationId;
    }

    const params = req?.params ?? {};

    if (
      typeof params.associationId === "string" &&
      params.associationId
    ) {
      return params.associationId;
    }

    const rawPath = String(
      req?.originalUrl ??
        req?.url ??
        "",
    ).split("?")[0];

    const parts = rawPath
      .split("/")
      .filter(Boolean);

    const apiIndex = parts.indexOf("api");

    if (apiIndex === -1) {
      return null;
    }

    const resource = parts[apiIndex + 1];
    const resourceId = parts[apiIndex + 2];

    if (!resource || !resourceId) {
      return null;
    }

    switch (resource) {
      case "associations":
        return resourceId;

      case "events": {
        const event = await this.prisma.event.findUnique({
          where: {
            id: resourceId,
          },
          select: {
            associationId: true,
          },
        });

        return event?.associationId ?? null;
      }

      case "finances": {
        const transaction =
          await this.prisma.transaction.findUnique({
            where: {
              id: resourceId,
            },
            select: {
              associationId: true,
            },
          });

        return transaction?.associationId ?? null;
      }

      case "files": {
        const file = await this.prisma.file.findUnique({
          where: {
            id: resourceId,
          },
          select: {
            associationId: true,
          },
        });

        return file?.associationId ?? null;
      }

      case "memberships": {
        const membership =
          await this.prisma.membership.findUnique({
            where: {
              id: resourceId,
            },
            select: {
              associationId: true,
            },
          });

        return membership?.associationId ?? null;
      }

      case "invitations": {
        const invitation =
          await this.prisma.invitation.findUnique({
            where: {
              id: resourceId,
            },
            select: {
              associationId: true,
            },
          });

        return invitation?.associationId ?? null;
      }

      case "reminders": {
        const reminder =
          await this.prisma.reminder.findUnique({
            where: {
              id: resourceId,
            },
            select: {
              associationId: true,
            },
          });

        return reminder?.associationId ?? null;
      }

      case "notifications": {
        const notification =
          await this.prisma.notification.findUnique({
            where: {
              id: resourceId,
            },
            select: {
              associationId: true,
            },
          });

        return notification?.associationId ?? null;
      }

      default:
        return null;
    }
  }
}


