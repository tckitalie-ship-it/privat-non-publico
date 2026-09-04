import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RemindersService } from "./reminders.service";
import { RemindersController } from "./reminders.controller";
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
  ],

  controllers: [
    NotificationsController,
    RemindersController,
  ],

  providers: [
    NotificationsService,
    NotificationsGateway,
    RemindersService,
  ],

  exports: [
    NotificationsService,
    NotificationsGateway,
  ],
})
export class NotificationsModule {}
