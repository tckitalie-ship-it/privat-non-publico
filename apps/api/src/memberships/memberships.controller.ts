import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import type { JwtUser } from "../auth/jwt-user.interface";
import {
  CreateMembershipDto,
  UpdateMembershipDto,
} from "./memberships.dto";
import { MembershipsService } from "./memberships.service";

@UseGuards(AuthGuard("jwt"))
@Controller("memberships")
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtUser,
    @Headers("x-association-id") associationId?: string,
  ) {
    return this.membershipsService.findAllForUser(user.id, associationId);
  }

  @Get("available-users")
  availableUsers(
    @CurrentUser() user: JwtUser,
    @Headers("x-association-id") associationId?: string,
  ) {
    return this.membershipsService.availableUsers(
      user.id,
      associationId,
    );
  }
  @Get("me")
  me(
    @CurrentUser() user: JwtUser,
    @Headers("x-association-id") associationId?: string,
  ) {
    return this.membershipsService.me(user.id, associationId);
  }

  @Post()
  create(
    @Body() dto: CreateMembershipDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.membershipsService.create(dto, user.id);
  }

  @Patch(":id")
  update(
    @Param("id") membershipId: string,
    @Body() dto: UpdateMembershipDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.membershipsService.update(membershipId, dto, user.id);
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
    return this.membershipsService.remove(membershipId, user.id);
  }
}
