import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";

import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { JwtUser } from "../auth/jwt-user.interface";

import { MembershipsService } from "./memberships.service";

@Controller("memberships")
@UseGuards(JwtAuthGuard)
export class MembershipsController {
  constructor(
    private readonly service: MembershipsService,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: JwtUser,
    @Headers("x-association-id") associationId?: string,
  ) {
    return this.service.findAllForUser(
      user.id,
      associationId || user.associationId,
    );
  }

  @Get("me")
  async me(
    @CurrentUser() user: JwtUser,
    @Headers("x-association-id") associationId?: string,
  ) {
    return this.service.me(
      user.id,
      associationId || user.associationId,
    );
  }

  @Patch(":id/role")
  async updateRole(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Body("role") role: string,
  ) {
    return this.service.updateRole(
      id,
      role,
      user.id,
    );
  }

  @Delete(":id")
  async remove(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
  ) {
    return this.service.remove(
      id,
      user.id,
    );
  }
}
