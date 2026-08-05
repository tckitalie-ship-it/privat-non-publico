import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

type CreateNotificationInput = {
  title?: string | null;
  message: string;
  associationId?: string | null;
  userId?: string | null;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Verifica che l'utente appartenga
   * all'associazione.
   */
  private async ensureMembership(
    userId: string,
    associationId: string,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Non sei membro di questa associazione",
      );
    }

    return membership;
  }

  /**
   * Verifica l'accesso dell'utente
   * a una notifica.
   */
  private async getAccessibleNotification(
    id: string,
    userId: string,
  ) {
    const notification =
      await this.prisma.notification.findUnique({
        where: {
          id,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        "Notifica non trovata",
      );
    }

    if (
      notification.userId &&
      notification.userId !== userId
    ) {
      throw new ForbiddenException(
        "Non hai accesso a questa notifica",
      );
    }

    if (notification.associationId) {
      await this.ensureMembership(
        userId,
        notification.associationId,
      );
    }

    if (
      !notification.userId &&
      !notification.associationId
    ) {
      throw new ForbiddenException(
        "Notifica non accessibile",
      );
    }

    return notification;
  }

  /**
   * Alias usato dagli altri servizi.
   */
  async create(
    dto: CreateNotificationInput,
  ) {
    return this.createNotification(dto);
  }

  /**
   * Crea una notifica internamente.
   */
  async createNotification(
    dto: CreateNotificationInput,
  ) {
     console.log("=== CREATE NOTIFICATION ===");
console.log(dto);
    const message = dto.message?.trim();
    const title = dto.title?.trim();

    if (!message) {
      throw new BadRequestException(
        "Il messaggio della notifica è obbligatorio",
      );
    }

    if (
      !dto.userId &&
      !dto.associationId
    ) {
      throw new BadRequestException(
        "La notifica deve essere collegata a un utente o a un'associazione",
      );
    }
      console.log("Saving notification...");
    return this.prisma.notification.create({
      data: {
        title: title || null,
        message,
        read: false,
        associationId:
          dto.associationId ?? null,
        userId: dto.userId ?? null,
      },
    });
  }

  /**
   * Crea una notifica dalla rotta autenticata.
   */
  async createFromUser(
    currentUserId: string,
    dto: CreateNotificationInput,
  ) {
    if (dto.associationId) {
      const membership =
        await this.ensureMembership(
          currentUserId,
          dto.associationId,
        );

      if (
        membership.role !== Role.OWNER &&
        membership.role !== Role.ADMIN
      ) {
        throw new ForbiddenException(
          "Non hai i permessi per creare notifiche per l'associazione",
        );
      }
    }

    const destinationUserId =
      dto.userId ?? currentUserId;

    if (
      dto.userId &&
      dto.userId !== currentUserId &&
      !dto.associationId
    ) {
      throw new ForbiddenException(
        "Non puoi creare notifiche per un altro utente",
      );
    }

    return this.createNotification({
      title: dto.title ?? null,
      message: dto.message,
      associationId:
        dto.associationId ?? null,
      userId: dto.associationId
        ? dto.userId ?? null
        : destinationUserId,
    });
  }

  /**
   * Notifiche personali dell'utente.
   */
  async findUserNotifications(
    userId: string,
  ) {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getUserNotifications(
    userId: string,
  ) {
    return this.findUserNotifications(
      userId,
    );
  }

  /**
   * Notifiche dell'associazione.
   */
  async findAssociationNotifications(
    associationId: string,
  ) {
    return this.prisma.notification.findMany({
      where: {
        associationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getAssociationNotifications(
    associationId: string,
    userId: string,
  ) {
    await this.ensureMembership(
      userId,
      associationId,
    );

    return this.findAssociationNotifications(
      associationId,
    );
  }

  /**
   * Dettaglio notifica.
   */
  async findOne(
    id: string,
    userId: string,
  ) {
    return this.getAccessibleNotification(
      id,
      userId,
    );
  }

  /**
   * Segna una notifica come letta.
   */
  async markAsRead(
    id: string,
    userId: string,
  ) {
    await this.getAccessibleNotification(
      id,
      userId,
    );

    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        read: true,
      },
    });
  }

  /**
   * Segna tutte le notifiche personali
   * dell'utente come lette.
   */
  async markAllAsRead(
    userId: string,
  ) {
    const result =
      await this.prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
        },
      });

    return {
      success: true,
      updated: result.count,
      message:
        result.count === 1
          ? "1 notifica segnata come letta"
          : `${result.count} notifiche segnate come lette`,
    };
  }

  /**
   * Elimina una notifica.
   */
  async delete(
    id: string,
  ) {
    return this.prisma.notification.delete({
      where: {
        id,
      },
    });
  }

  async deleteNotification(
    id: string,
    userId: string,
  ) {
    const notification =
      await this.getAccessibleNotification(
        id,
        userId,
      );

    if (notification.associationId) {
      const membership =
        await this.ensureMembership(
          userId,
          notification.associationId,
        );

      const isPersonalNotification =
        notification.userId === userId;

      const canManageAssociation =
        membership.role === Role.OWNER ||
        membership.role === Role.ADMIN;

      if (
        !isPersonalNotification &&
        !canManageAssociation
      ) {
        throw new ForbiddenException(
          "Non hai i permessi per eliminare questa notifica",
        );
      }
    }

    await this.prisma.notification.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: "Notifica eliminata",
    };
  }
}