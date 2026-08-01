import {
  Body,
  Controller,
  Delete,
  Get,
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

  /**
   * Tutti i membri dell'associazione attiva.
   * Se il vecchio token non contiene associationId,
   * il service usa la prima membership dell'utente.
   */
  @Get()
  async findAll(
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.findAllForUser(
      user.id,
      user.associationId,
    );
  }

  /**
   * Membership dell'utente autenticato.
   */
  @Get("me")
  async me(
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.me(
      user.id,
      user.associationId,
    );
  }

  /**
   * Modifica il ruolo di un membro.
   */
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

  /**
   * Rimuove un membro.
   */
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