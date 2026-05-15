import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [EventsController],
  providers: [EventsService, EventsGateway],
})
export class EventsModule {}