import { Module } from '@nestjs/common';
import { FinancesModule } from './finances/finances.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AssociationsModule } from './associations/associations.module';
import { MembershipsModule } from './memberships/memberships.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InvitationsModule } from './invitations/invitations.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    PrismaModule,
    FinancesModule,
    UsersModule,
    AuthModule,
    AssociationsModule,
    MembershipsModule,
    DashboardModule,
    InvitationsModule,
    EventsModule,
  ],
})
export class AppModule {}