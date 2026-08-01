import { Injectable } from "@nestjs/common";
import { AuditLogAnalyticsService } from "./audit-log-analytics.service";

@Injectable()
export class AuditLogDashboardService {
  constructor(private readonly analytics: AuditLogAnalyticsService) {}

  /**
   * Dashboard globale (overview sistema)
   */
  async globalDashboard() {
    const [kpis, trend, categories, topActions, topUsers, heatmap] =
      await Promise.all([
        this.analytics.globalKpis(),
        this.analytics.dailyTrend(),
        this.analytics.categoryDistribution(),
        this.analytics.topActions(),
        this.analytics.topUsers(),
        this.analytics.activityHeatmap(),
      ]);

    return {
      kpis,
      trend,
      categories,
      topActions,
      topUsers,
      heatmap,
    };
  }

  /**
   * Dashboard per associazione
   */
  async associationDashboard(associationId: string) {
    const [
      kpis,
      trend,
      categories,
      topActions,
      topUsers,
      heatmap,
    ] = await Promise.all([
      this.analytics.associationKpis(associationId),
      this.analytics.dailyTrend(associationId),
      this.analytics.categoryDistribution(associationId),
      this.analytics.topActions(associationId),
      this.analytics.topUsers(associationId),
      this.analytics.activityHeatmap(associationId),
    ]);

    return {
      associationId,
      kpis,
      trend,
      categories,
      topActions,
      topUsers,
      heatmap,
    };
  }

  /**
   * Trend giornaliero (ultimi 30 giorni)
   */
  async trend(associationId?: string) {
    return this.analytics.dailyTrend(associationId);
  }

  /**
   * Heatmap attività utenti (per ora del giorno)
   */
  async heatmap(associationId?: string) {
    return this.analytics.activityHeatmap(associationId);
  }

  /**
   * Distribuzione categorie (per pie chart)
   */
  async categories(associationId?: string) {
    return this.analytics.categoryDistribution(associationId);
  }

  /**
   * Azioni più frequenti (per bar chart)
   */
  async topActions(associationId?: string) {
    return this.analytics.topActions(associationId);
  }

  /**
   * Utenti più attivi (leaderboard)
   */
  async topUsers(associationId?: string) {
    return this.analytics.topUsers(associationId);
  }
}
