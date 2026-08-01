import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface AuditLogQueryParams {
  associationId?: string;
  userId?: string;
  category?: string;
  keyword?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
  order?: "asc" | "desc";
}

@Injectable()
export class AuditLogQueryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ricerca avanzata con filtri combinati
   */
  async query(params: AuditLogQueryParams) {
    const {
      associationId,
      userId,
      category,
      keyword,
      from,
      to,
      page = 1,
      pageSize = 30,
      order = "desc",
    } = params;

    const where: any = {};

    if (associationId) where.associationId = associationId;
    if (userId) where.userId = userId;
    if (category) where.category = category;

    if (keyword) {
      where.OR = [
        { action: { contains: keyword, mode: "insensitive" } },
        { category: { contains: keyword, mode: "insensitive" } },
        { metadata: { contains: keyword } },
      ];
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: order },
        skip,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      items,
    };
  }

  /**
   * Ricerca timeline (raggruppata per giorno)
   */
  async timeline(params: AuditLogQueryParams) {
    const result = await this.query(params);

    const map: Record<string, any[]> = {};

    result.items.forEach((log) => {
      const day = log.createdAt.toISOString().split("T")[0];
      if (!map[day]) map[day] = [];
      map[day].push(log);
    });

    return {
      ...result,
      grouped: Object.entries(map).map(([day, events]) => ({
        day,
        events,
      })),
    };
  }

  /**
   * Ricerca full‑text su tutta l’associazione
   */
  async search(associationId: string, keyword: string) {
    return this.query({ associationId, keyword });
  }

  /**
   * Ricerca per intervallo temporale
   */
  async range(associationId: string, from: Date, to: Date) {
    return this.query({ associationId, from, to });
  }
}
