import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";

import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Public } from "../auth/public.decorator";

import { InvitationsService } from "./invitations.service";

@Controller("invitations")
export class InvitationsController {
  constructor(
    private readonly invitations: InvitationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Headers("x-association-id") associationId?: string,
  ) {
    return this.invitations.findAll(
      user.sub,
      associationId || user.associationId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() user: any,
    @Body()
    dto: {
      email: string;
      role: string;
    },
    @Headers("x-association-id") associationId?: string,
  ) {
    const resolvedAssociationId =
      associationId?.trim() ||
      user.associationId?.trim();

    return this.invitations.createInvitation(
      user.sub,
      {
        email: dto.email,
        role: dto.role,
        associationId: resolvedAssociationId,
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async remove(
    @CurrentUser() user: any,
    @Param("id") id: string,
  ) {
    return this.invitations.removeInvitation(
      id,
      user.sub,
    );
  }

  @Public()
  @Get("check/:token")
  async check(
    @Param("token") token: string,
  ) {
    return this.invitations.checkToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post("accept/:token")
  async accept(
    @CurrentUser() user: any,
    @Param("token") token: string,
  ) {
    return this.invitations.acceptInvitation(
      token,
      user.sub,
    );
  }

  @Public()
  @Post("accept-and-register")
  async acceptAndRegister(
    @Body()
    dto: {
      token: string;
      email: string;
      password: string;
    },
  ) {
    return this.invitations.acceptAndRegister({
      token: dto.token,
      email: dto.email,
      password: dto.password,
    });
  }
}