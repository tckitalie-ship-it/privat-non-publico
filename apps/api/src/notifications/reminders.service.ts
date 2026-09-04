import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
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
   * Recupera i reminder dell'utente autenticato.
   */
  async findUserReminders(userId: string) {
    return this.prisma.reminder.findMany({
      where: {
        userId,
      },
      orderBy: {
        remindAt: "asc",
      },
    });
  }
     /**
   * Crea un reminder per l'utente autenticato.
   */
  async createReminder(
    userId: string,
    dto: {
      title?: string | null;
      message: string;
      remindAt: Date;
      associationId?: string | null;
    },
  ) {
    const message = dto.message?.trim();
    const title = dto.title?.trim();

    if (!message) {
      throw new BadRequestException(
        "Il messaggio del reminder è obbligatorio",
      );
    }

    if (Number.isNaN(dto.remindAt.getTime())) {
      throw new BadRequestException(
        "La data del reminder non è valida",
      );
    }

    if (dto.associationId) {
      const membership =
        await this.prisma.membership.findFirst({
          where: {
            userId,
            associationId: dto.associationId,
          },
        });

      if (!membership) {
        throw new ForbiddenException(
          "Non sei membro di questa associazione",
        );
      }
    }

    return this.prisma.reminder.create({
      data: {
        title: title || null,
        message,
        remindAt: dto.remindAt,
        userId,
        associationId:
          dto.associationId ?? null,
      },
    });
  }
     /**
   * Segna un reminder come completato.
   */
      /**
   * Elimina un reminder.
   */
  async deleteReminder(
    reminderId: string,
    userId: string,
  ) {
    const reminder =
      await this.prisma.reminder.findUnique({
        where: {
          id: reminderId,
        },
      });

    if (!reminder) {
      throw new NotFoundException(
        "Reminder non trovato",
      );
    }

    if (reminder.userId !== userId) {
      throw new ForbiddenException(
        "Non hai accesso a questo reminder",
      );
    }

    await this.prisma.reminder.delete({
      where: {
        id: reminderId,
      },
    });

    return {
      success: true,
      message: "Reminder eliminato",
    };
  }
  async completeReminder(
    reminderId: string,
    userId: string,
  ) {
    const reminder =
      await this.prisma.reminder.findUnique({
        where: {
          id: reminderId,
        },
      });

    if (!reminder) {
      throw new NotFoundException(
        "Reminder non trovato",
      );
    }

    if (reminder.userId !== userId) {
      throw new ForbiddenException(
        "Non hai accesso a questo reminder",
      );
    }

    return this.prisma.reminder.update({
      where: {
        id: reminderId,
      },
      data: {
        completed: true,
      },
    });
  }
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