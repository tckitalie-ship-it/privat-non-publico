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

import { AssociationsService } from "./associations.service";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";

@Controller("associations")
@UseGuards(JwtAuthGuard)
export class AssociationsController {
  constructor(
    private readonly associationsService: AssociationsService,
  ) {}

  /**
   * Associazioni dell'utente autenticato.
   */
  @Get()
  async findAll(
    @CurrentUser() user: JwtUser,
  ) {
    return this.associationsService.findAllForUser(
      user.id,
    );
  }

  /**
   * Dettaglio associazione.
   *
   * Accessibile a tutti i membri.
   */
  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.associationsService.findOneForUser(
      id,
      user.id,
    );
  }

  /**
   * Crea associazione.
   *
   * Il creatore diventa OWNER.
   */
  @Post()
  async create(
    @Body() dto: CreateAssociationDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.associationsService.create(
      dto,
      user.id,
    );
  }

  /**
   * Modifica associazione.
   *
   * Il controllo OWNER viene effettuato
   * nel service/backend.
   */
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateAssociationDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.associationsService.update(
      id,
      dto,
      user.id,
    );
  }

  /**
   * Elimina associazione.
   *
   * Il controllo OWNER viene effettuato
   * nel service/backend.
   */
  @Delete(":id")
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.associationsService.remove(
      id,
      user.id,
    );
  }
}
