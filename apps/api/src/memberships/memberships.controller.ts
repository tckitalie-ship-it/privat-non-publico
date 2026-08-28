import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { CurrentUser } from "../auth/current-user.decorator";
import type { JwtUser } from "../auth/jwt-user.interface";
import { MembershipsService } from "./memberships.service";

@UseGuards(AuthGuard("jwt"))
@Controller("memberships")
export class MembershipsController {
  constructor(
    private readonly membershipsService: MembershipsService,
  ) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtUser,
  ) {
    return this.membershipsService.findAllForUser(
      user.id,
    );
  }

  @Get("me")
  me(
    @CurrentUser() user: JwtUser,
  ) {
    return this.membershipsService.me(
      user.id,
    );
  }

  @Patch(":id/role")
  updateRole(
    @Param("id") membershipId: string,
    @Body("role") role: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.membershipsService.updateRole(
      membershipId,
      role,
      user.id,
    );
  }

  @Delete(":id")
  remove(
    @Param("id") membershipId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.membershipsService.remove(
      membershipId,
      user.id,
    );
  }
}