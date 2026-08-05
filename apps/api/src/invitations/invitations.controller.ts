import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { InvitationsService } from "./invitations.service";

@Controller("invitations")
export class InvitationsController {
  constructor(
    private readonly invitations: InvitationsService,
  ) {}

  /**
   * Tutti gli inviti dell'utente
   * per tutte le sue associazioni.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @CurrentUser() user: any,
  ) {
    return this.invitations.findAll(user.sub);
  }

  /**
   * Crea un invito.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() user: any,
    @Body()
    dto: {
      email: string;
      role: string;
      associationId?: string;
    },
  ) {
    return this.invitations.createInvitation(
      user.sub,
      {
        email: dto.email,
        role: dto.role as any,
        associationId:
          dto.associationId ??
          user.associationId,
      },
    );
  }

  /**
   * Elimina un invito.
   */
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

  /**
   * Verifica il token dell'invito.
   */
  @Get("check/:token")
  async check(
    @Param("token") token: string,
  ) {
    return this.invitations.checkToken(token);
  }

  /**
   * Accetta l'invito per un utente
   * già registrato.
   */
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

  /**
   * Accetta l'invito e registra
   * un nuovo utente.
   */
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