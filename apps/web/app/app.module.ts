import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MembershipsModule } from './memberships/memberships.module';
import { AssociationsModule } from './associations/associations.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    MembershipsModule,
    AssociationsModule,
    TransactionsModule,
  ],
})
export class AppModule {}