import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { EventsService } from "./events.service";

type AuthenticatedRequest = Request & {
  user: {
    id?: string;
    sub?: string;
  };
};

type ImportedEvent = {
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt?: string | null;
};

@Controller("events")
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  private getUserId(
    request: AuthenticatedRequest,
  ): string {
    const userId =
      request.user?.id ??
      request.user?.sub;

    if (!userId) {
      throw new Error(
        "Utente autenticato non valido",
      );
    }

    return userId;
  }

  @Get("association/:associationId")
  async findAllByAssociation(
    @Param("associationId")
    associationId: string,
    @Req()
    request: AuthenticatedRequest,
  ) {
    const userId =
      this.getUserId(request);

    return this.eventsService.findAll(
      associationId,
      userId,
    );
  }

  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @Req()
    request: AuthenticatedRequest,
  ) {
    const userId =
      this.getUserId(request);

    return this.eventsService.findOne(
      id,
      userId,
    );
  }

  @Post()
  async create(
    @Body()
    body: {
      associationId?: string;
      title: string;
      description?: string | null;
      location?: string | null;
      startsAt: string;
      endsAt?: string | null;
    },
    @Headers("x-association-id")
    headerAssociationId: string | undefined,
    @Req()
    request: AuthenticatedRequest,
  ) {
    const userId =
      this.getUserId(request);

    const associationId =
      body.associationId ??
      headerAssociationId;

    if (!associationId) {
      throw new Error(
        "Association ID mancante",
      );
    }

    return this.eventsService.createEvent(
      userId,
      {
        associationId,
        title: body.title,
        description:
          body.description ?? null,
        location:
          body.location ?? null,
        startsAt:
          new Date(body.startsAt),
        endsAt:
          body.endsAt
            ? new Date(body.endsAt)
            : null,
      },
    );
  }

  @Post("import")
  async importEvents(
    @Body()
    body: ImportedEvent[],
    @Headers("x-association-id")
    headerAssociationId: string | undefined,
    @Req()
    request: AuthenticatedRequest,
  ) {
    const userId =
      this.getUserId(request);

    const associationId =
      headerAssociationId;

    if (!associationId) {
      throw new Error(
        "Association ID mancante",
      );
    }

    return this.eventsService.importEvents(
      userId,
      associationId,
      body,
    );
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body()
    body: {
      title?: string;
      description?: string | null;
      location?: string | null;
      startsAt?: string;
      endsAt?: string | null;
    },
    @Req()
    request: AuthenticatedRequest,
  ) {
    const userId =
      this.getUserId(request);

    return this.eventsService.updateEvent(
      id,
      userId,
      {
        ...(body.title !== undefined
          ? { title: body.title }
          : {}),
        ...(body.description !== undefined
          ? {
              description:
                body.description,
            }
          : {}),
        ...(body.location !== undefined
          ? {
              location:
                body.location,
            }
          : {}),
        ...(body.startsAt !== undefined
          ? {
              startsAt: new Date(
                body.startsAt,
              ),
            }
          : {}),
        ...(body.endsAt !== undefined
          ? {
              endsAt:
                body.endsAt
                  ? new Date(body.endsAt)
                  : null,
            }
          : {}),
      },
    );
  }

  @Delete(":id")
  async remove(
    @Param("id") id: string,
    @Req()
    request: AuthenticatedRequest,
  ) {
    const userId =
      this.getUserId(request);

    return this.eventsService.deleteEvent(
      id,
      userId,
    );
  }

  @Post(":id/register")
  async register(
    @Param("id") id: string,
    @Req()
    request: AuthenticatedRequest,
  ) {
    try {
      const userId =
        this.getUserId(request);

      console.log(
        "[EVENT REGISTER] richiesta ricevuta",
        {
          eventId: id,
          userId,
        },
      );

      const result =
        await this.eventsService.registerToEvent(
          id,
          userId,
        );

      console.log(
        "[EVENT REGISTER] successo",
        result,
      );

      return result;
    } catch (error) {
      console.error(
        "[EVENT REGISTER] ERRORE COMPLETO:",
        error,
      );

      throw error;
    }
  }

  @Get(":id/registrations")
  async getRegistrations(
    @Param("id") id: string,
    @Req()
    request: AuthenticatedRequest,
  ) {
    const userId =
      this.getUserId(request);

    return this.eventsService.getRegistrations(
      id,
      userId,
    );
  }

  @Delete(":id/register")
  async unregister(
    @Param("id") id: string,
    @Req()
    request: AuthenticatedRequest,
  ) {
    const userId =
      this.getUserId(request);

    return this.eventsService.unregisterFromEvent(
      id,
      userId,
    );
  }
}