import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { JwtUser } from "../auth/jwt-user.interface";

import { NotificationsService } from "./notifications.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notifications:
      NotificationsService,
  ) {}

  /**
   * Notifiche personali dell'utente.
   *
   * GET /api/notifications/me
   */
  @Get("me")
  async getMyNotifications(
    @CurrentUser() user: JwtUser,
  ) {
    return this.notifications.getUserNotifications(
      user.id,
    );
  }

  /**
   * Notifiche dell'associazione.
   *
   * GET /api/notifications/association/:associationId
   */
  @Get("association/:associationId")
  async getAssociationNotifications(
    @CurrentUser() user: JwtUser,
    @Param("associationId")
    associationId: string,
  ) {
    return this.notifications.getAssociationNotifications(
      associationId,
      user.id,
    );
  }

  /**
   * Crea una notifica.
   *
   * POST /api/notifications
   */
  @Post()
  async create(
    @CurrentUser() user: JwtUser,
    @Body()
    dto: {
      title?: string | null;
      message: string;
      associationId?: string | null;
      userId?: string | null;
    },
  ) {
    return this.notifications.createFromUser(
      user.id,
      {
        title: dto.title ?? null,
        message: dto.message,
        associationId:
          dto.associationId ?? null,
        userId: dto.userId ?? null,
      },
    );
  }

  /**
   * Segna tutte le notifiche personali come lette.
   *
   * PATCH /api/notifications/read-all
   */
  @Patch("read-all")
  async markAllAsRead(
    @CurrentUser() user: JwtUser,
  ) {
    return this.notifications.markAllAsRead(
      user.id,
    );
  }

  /**
   * Segna una notifica come letta.
   *
   * PATCH /api/notifications/:id/read
   */
  @Patch(":id/read")
  async markAsRead(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
  ) {
    return this.notifications.markAsRead(
      id,
      user.id,
    );
  }

  /**
   * Dettaglio notifica.
   *
   * GET /api/notifications/:id
   */
  @Get(":id")
  async findOne(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
  ) {
    return this.notifications.findOne(
      id,
      user.id,
    );
  }

  /**
   * Elimina una notifica.
   *
   * DELETE /api/notifications/:id
   */
  @Delete(":id")
  async delete(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
  ) {
    return this.notifications.deleteNotification(
      id,
      user.id,
    );
  }
}