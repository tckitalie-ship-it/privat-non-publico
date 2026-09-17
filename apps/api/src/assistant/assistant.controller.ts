import {
  Body,
  Controller,
  Headers,
  Post,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { JwtUser } from "../auth/jwt-user.interface";

import { AssistantService } from "./assistant.service";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

@Controller("assistant")
@UseGuards(JwtAuthGuard)
export class AssistantController {
  constructor(
    private readonly assistantService: AssistantService,
  ) {}

  @Post("ask")
  async ask(
    @CurrentUser() user: JwtUser,
    @Headers("x-association-id")
    associationId?: string,
    @Body("message") message?: string,
    @Body("history") history: ChatMessage[] = [],
  ) {
    return this.assistantService.ask(
      message ?? "",
      history,
      user.id,
      associationId,
    );
  }
}