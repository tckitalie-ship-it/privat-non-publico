import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('kpis')
  async getKpis(@Req() req: any) {
    return this.dashboardService.getKpis(req.user);
  }

  @Get('revenue-chart')
  async getRevenueChart(@Req() req: any) {
    return this.dashboardService.getRevenueChart(req.user);
  }
}