import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  getDashboard(user: any) {
    return {
      message: 'Dashboard OK',
      user,
    };
  }

  getKpis(user: any) {
    return {
      user,
      membersCount: 0,
      eventsCount: 0,
      revenue: 0,
    };
  }
}