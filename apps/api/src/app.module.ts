import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AssociationsModule } from './associations/associations.module';
import { MembershipsModule } from './memberships/memberships.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventsModule } from './events/events.module';
import { InvitationsModule } from './invitations/invitations.module';
import { FinancesModule } from './finances/finances.module';
import { BillingModule } from './billing/billing.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,

    AuthModule,
    UsersModule,
    AssociationsModule,
    MembershipsModule,
    DashboardModule,
    EventsModule,
    InvitationsModule,
    FinancesModule,
    BillingModule,
    NotificationsModule,
  ],
})
export class AppModule {}