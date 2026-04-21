import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MembershipsModule } from './memberships/memberships.module';

@Module({
  imports: [UsersModule, AuthModule, MembershipsModule],
})
export class AppModule {}