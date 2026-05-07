import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AssociationsModule } from './associations/associations.module';
import { BillingModule } from './billing/billing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventsModule } from './events/events.module';
import { FinancesModule } from './finances/finances.module';
import { InvitationsModule } from './invitations/invitations.module';
import { MembershipsModule } from './memberships/memberships.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
}),

    AuthModule,
    UsersModule,
    AssociationsModule,
    MembershipsModule,
    DashboardModule,
    EventsModule,
    InvitationsModule,
    FinancesModule,
    BillingModule,
  ],
})
export class AppModule {}