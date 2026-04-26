import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AssociationsModule } from './associations/associations.module';
import { MembershipsModule } from './memberships/memberships.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InvitationsModule } from './invitations/invitations.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    AssociationsModule,
    MembershipsModule,
    DashboardModule,
    InvitationsModule,
  ],
})
export class AppModule {}