import {
  Controller,
  Get,
  Param,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { AuditLogAnalyticsService } from "./audit-log-analytics.service";

@Controller("api/audit-log/dashboard")
export class AuditLogDashboardController {
  constructor(private readonly analytics: AuditLogAnalyticsService) {}

  /**
   * Dashboard globale (overview sistema)
   */
  @UseGuards(JwtAuthGuard)
  @Get("global")
  async globalDashboard(@CurrentUser() user: any) {
    const kpis = await this.analytics.globalKpis();
    const trend = await this.analytics.dailyTrend();
    const categories = await this.analytics.categoryDistribution();
    const topActions = await this.analytics.topActions();
    const topUsers = await this.analytics.topUsers();
    const heatmap = await this.analytics.activityHeatmap();

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
  @UseGuards(JwtAuthGuard)
  @Get("association/:associationId")
  async associationDashboard(
    @CurrentUser() user: any,
    @Param("associationId") associationId: string
  ) {
    const kpis = await this.analytics.associationKpis(associationId);
    const trend = await this.analytics.dailyTrend(associationId);
    const categories = await this.analytics.categoryDistribution(associationId);
    const topActions = await this.analytics.topActions(associationId);
    const topUsers = await this.analytics.topUsers(associationId);
    const heatmap = await this.analytics.activityHeatmap(associationId);

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
   * Solo trend (per grafici line chart)
   */
  @UseGuards(JwtAuthGuard)
  @Get("trend/:associationId")
  async trend(
    @CurrentUser() user: any,
    @Param("associationId") associationId: string
  ) {
    return this.analytics.dailyTrend(associationId);
  }

  /**
   * Solo heatmap (per grafici heatmap)
   */
  @UseGuards(JwtAuthGuard)
  @Get("heatmap/:associationId")
  async heatmap(
    @CurrentUser() user: any,
    @Param("associationId") associationId: string
  ) {
    return this.analytics.activityHeatmap(associationId);
  }

  /**
   * Solo categorie (per pie chart)
   */
  @UseGuards(JwtAuthGuard)
  @Get("categories/:associationId")
  async categories(
    @CurrentUser() user: any,
    @Param("associationId") associationId: string
  ) {
    return this.analytics.categoryDistribution(associationId);
  }

  /**
   * Solo top actions (per bar chart)
   */
  @UseGuards(JwtAuthGuard)
  @Get("top-actions/:associationId")
  async topActions(
    @CurrentUser() user: any,
    @Param("associationId") associationId: string
  ) {
    return this.analytics.topActions(associationId);
  }

  /**
   * Solo top users (per leaderboard)
   */
  @UseGuards(JwtAuthGuard)
  @Get("top-users/:associationId")
  async topUsers(
    @CurrentUser() user: any,
    @Param("associationId") associationId: string
  ) {
    return this.analytics.topUsers(associationId);
  }
}
