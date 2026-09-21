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
    private readonly notifications: NotificationsService,
  ) {}

  @Get("me")
  async getMyNotifications(
    @CurrentUser() user: JwtUser,
  ) {
    return this.notifications.getUserNotifications(
      user.id,
      user.associationId,
    );
  }

  @Get("association/:associationId")
  async getAssociationNotifications(
    @CurrentUser() user: JwtUser,
    @Param("associationId") associationId: string,
  ) {
    return this.notifications.getAssociationNotifications(
      associationId,
      user.id,
    );
  }

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
        associationId: dto.associationId ?? null,
        userId: dto.userId ?? null,
      },
    );
  }

  @Patch("read-all")
  async markAllAsRead(
    @CurrentUser() user: JwtUser,
  ) {
    return this.notifications.markAllAsRead(user.id, user.associationId);
  }

  @Patch(":id/read")
  async markAsRead(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
  ) {
    return this.notifications.markAsRead(id, user.id);
  }

  @Get(":id")
  async findOne(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
  ) {
    return this.notifications.findOne(id, user.id);
  }

  @Delete(":id")
  async delete(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
  ) {
    return this.notifications.deleteNotification(id, user.id);
  }
}
