import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssociationsController } from './associations.controller';
import { AssociationsService } from './associations.service';

@Module({
  controllers: [AssociationsController],
  providers: [AssociationsService, PrismaService],
})
export class AssociationsModule {}