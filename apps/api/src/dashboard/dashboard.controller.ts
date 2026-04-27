import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AssociationActiveGuard } from '../auth/association-active.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, AssociationActiveGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(@Req() req: any) {
    return this.dashboardService.getDashboard(req.user);
  }

  @Get('kpis')
  getKpis(@Req() req: any) {
    return this.dashboardService.getKpis(req.user);
  }
}