import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AssociationsModule } from './associations/associations.module';
import { MembershipsModule } from './memberships/memberships.module';
import { InvitationsModule } from './invitations/invitations.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    AssociationsModule,
    MembershipsModule,
    InvitationsModule,
  ],
})
export class AppModule {}