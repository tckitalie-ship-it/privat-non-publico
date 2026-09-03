import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

import { PrismaService } from "../prisma/prisma.service";
import { NotificationsGateway } from "./notifications.gateway";
import { NotificationsService } from "./notifications.service";

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(
    RemindersService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Controlla periodicamente i reminder scaduti.
   *
   * Per ora eseguiamo il controllo ogni minuto.
   */
  @Cron("* * * * *")
  async processReminders() {
    const now = new Date();

    const reminders =
      await this.prisma.reminder.findMany({
        where: {
          completed: false,
          remindAt: {
            lte: now,
          },
        },
        orderBy: {
          remindAt: "asc",
        },
      });

    if (reminders.length === 0) {
      return;
    }

    this.logger.log(
      `Trovati ${reminders.length} reminder da elaborare`,
    );

    for (const reminder of reminders) {
      try {
        const notification =
          await this.notifications.createNotification({
            title: reminder.title,
            message: reminder.message,
            userId: reminder.userId,
            associationId:
              reminder.associationId,
          });

        NotificationsGateway.emitNotification(
          notification,
        );

        await this.prisma.reminder.update({
          where: {
            id: reminder.id,
          },
          data: {
            completed: true,
          },
        });

        this.logger.log(
          `Reminder ${reminder.id} elaborato`,
        );
      } catch (error) {
        this.logger.error(
          `Errore nell'elaborazione del reminder ${reminder.id}`,
          error instanceof Error
            ? error.stack
            : String(error),
        );
      }
    }
  }
}