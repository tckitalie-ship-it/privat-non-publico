import { Module } from '@nestjs/common';
import { AssociationsController } from './associations.controller';
import { AssociationsService } from './associations.service';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AssociationsController],
  providers: [AssociationsService],
})
export class AssociationsModule {}