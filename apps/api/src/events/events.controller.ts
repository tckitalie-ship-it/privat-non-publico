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

import { EventsService } from "./events.service";

@Controller("events")
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly events: EventsService,
  ) {}

  /**
   * Crea un evento.
   */
  @Post()
  async create(
    @CurrentUser() user: any,
    @Body()
    dto: {
      associationId: string;
      title: string;
      description?: string | null;
      startsAt: Date;
      endsAt?: Date | null;
      location?: string | null;
    },
  ) {
    return this.events.createEvent(
      user.sub,
      dto,
    );
  }

  /**
   * Elenco eventi dell'associazione.
   */
  @Get("association/:associationId")
  async findAll(
    @CurrentUser() user: any,
    @Param("associationId")
    associationId: string,
  ) {
    return this.events.findAll(
      associationId,
      user.sub,
    );
  }

  /**
   * Registra l'utente autenticato all'evento.
   */
  @Post(":eventId/register")
  async register(
    @CurrentUser() user: any,
    @Param("eventId") eventId: string,
  ) {
    return this.events.registerToEvent(
      eventId,
      user.sub,
    );
  }

  /**
   * Annulla la registrazione dell'utente.
   */
  @Delete(":eventId/register")
  async unregister(
    @CurrentUser() user: any,
    @Param("eventId") eventId: string,
  ) {
    return this.events.unregisterFromEvent(
      eventId,
      user.sub,
    );
  }

  /**
   * Elenco partecipanti dell'evento.
   */
  @Get(":eventId/registrations")
  async registrations(
    @CurrentUser() user: any,
    @Param("eventId") eventId: string,
  ) {
    return this.events.getRegistrations(
      eventId,
      user.sub,
    );
  }

  /**
   * Dettaglio evento.
   */
  @Get(":eventId")
  async findOne(
    @CurrentUser() user: any,
    @Param("eventId") eventId: string,
  ) {
    return this.events.findOne(
      eventId,
      user.sub,
    );
  }

  /**
   * Aggiorna evento.
   */
  @Patch(":eventId")
  async update(
    @CurrentUser() user: any,
    @Param("eventId") eventId: string,
    @Body()
    dto: {
      title?: string;
      description?: string | null;
      startsAt?: Date;
      endsAt?: Date | null;
      location?: string | null;
    },
  ) {
    return this.events.updateEvent(
      eventId,
      user.sub,
      dto,
    );
  }

  /**
   * Elimina evento.
   */
  @Delete(":eventId")
  async delete(
    @CurrentUser() user: any,
    @Param("eventId") eventId: string,
  ) {
    return this.events.deleteEvent(
      eventId,
      user.sub,
    );
  }
}