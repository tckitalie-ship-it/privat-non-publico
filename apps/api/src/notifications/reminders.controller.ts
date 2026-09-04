import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RemindersService } from "./reminders.service";

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    sub?: string;
  };
};

function getUserId(request: AuthenticatedRequest): string {
  const userId = request.user?.id ?? request.user?.sub;

  if (!userId) {
    throw new Error("Utente autenticato non trovato");
  }

  return userId;
}

@Controller("reminders")
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(
    private readonly remindersService: RemindersService,
  ) {}

  @Get()
  async findMyReminders(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.remindersService.findUserReminders(
      getUserId(request),
    );
  }

  @Post()
  async createReminder(
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      title?: string | null;
      message: string;
      remindAt: string;
      associationId?: string | null;
    },
  ) {
    return this.remindersService.createReminder(
      getUserId(request),
      {
        title: body.title,
        message: body.message,
        remindAt: new Date(body.remindAt),
        associationId: body.associationId,
      },
    );
  }

  @Patch(":id/complete")
  async completeReminder(
    @Req() request: AuthenticatedRequest,
    @Param("id") reminderId: string,
  ) {
    return this.remindersService.completeReminder(
      reminderId,
      getUserId(request),
    );
  }

  @Delete(":id")
  async deleteReminder(
    @Req() request: AuthenticatedRequest,
    @Param("id") reminderId: string,
  ) {
    return this.remindersService.deleteReminder(
      reminderId,
      getUserId(request),
    );
  }
}