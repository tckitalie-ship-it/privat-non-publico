import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditLogAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * KPI globali del sistema
   */
  async globalKpis() {
    const [totalLogs, totalUsers, totalAssociations] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.user.count(),
      this.prisma.association.count(),
    ]);

    return {
      totalLogs,
      totalUsers,
      totalAssociations,
    };
  }

  /**
   * KPI per associazione
   */
  async associationKpis(associationId: string) {
    const [logs, users, events, finances] = await Promise.all([
      this.prisma.auditLog.count({ where: { associationId } }),
      this.prisma.membership.count({ where: { associationId } }),
      this.prisma.event.count({ where: { associationId } }),
      this.prisma.transaction.count({ where: { associationId } }), // ✅ financeTransaction → transaction
    ]);

    return {
      logs,
      users,
      events,
      finances,
    };
  }

  /**
   * Trend temporale (ultimi 30 giorni)
   */
  async dailyTrend(associationId?: string) {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const logs = await this.prisma.auditLog.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: since },
        ...(associationId ? { associationId } : {}),
      },
      _count: { id: true },
    });

    const trend = logs.map((l) => ({
      day: l.createdAt.toISOString().split("T")[0],
      count: l._count?.id ?? 0,
    }));

    return trend;
  }

  /**
   * Heatmap attività utenti (per ora del giorno)
   */
  async activityHeatmap(associationId?: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: associationId ? { associationId } : {},
      select: { createdAt: true },
    });

    const buckets: Record<number, number> = {};
    for (let i = 0; i < 24; i++) buckets[i] = 0;

    logs.forEach((log) => {
      const hour = log.createdAt.getHours();
      buckets[hour]++;
    });

    return Object.entries(buckets).map(([hour, count]) => ({
      hour: Number(hour),
      count,
    }));
  }

  /**
   * Azioni più frequenti
   */
  async topActions(associationId?: string) {
    const actions = await this.prisma.auditLog.groupBy({
      by: ["action"],
      where: associationId ? { associationId } : {},
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    return actions.map((a) => ({
      action: a.action,
      count: a._count?.id ?? 0,
    }));
  }

  /**
   * Utenti più attivi
   */
  async topUsers(associationId?: string) {
    const users = await this.prisma.auditLog.groupBy({
      by: ["actorId"], // ✅ userId → actorId
      where: associationId ? { associationId } : {},
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    return users.map((u) => ({
      actorId: u.actorId,          // ✅ userId → actorId
      count: u._count?.id ?? 0,    // ✅ safe count
    }));
  }

  /**
   * Categoria più attiva (LOGIN, EVENT, FILE, FINANCE…)
   */
  async categoryDistribution(associationId?: string) {
    const categories = await this.prisma.auditLog.groupBy({
      by: ["category"],
      where: associationId ? { associationId } : {},
      _count: { id: true },
    });

    return categories.map((c) => ({
      category: c.category,
      count: c._count?.id ?? 0,
    }));
  }
}
