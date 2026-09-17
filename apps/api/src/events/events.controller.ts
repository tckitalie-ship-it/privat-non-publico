import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { EventsService } from "./events.service";

interface AuthenticatedRequest extends Request {
  user?: {
    sub?: string;
    id?: string;
    userId?: string;
  };
}

interface CreateEventDto {
  associationId: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string | Date;
  endsAt?: string | Date | null;
}

interface UpdateEventDto {
  title?: string;
  description?: string | null;
  location?: string | null;
  startsAt?: string | Date;
  endsAt?: string | Date | null;
  capacity?: number | null;
  registrationEnabled?: boolean;
  status?: "SCHEDULED" | "CANCELLED" | "COMPLETED";
}

interface ImportEventDto {
  associationId: string;
  events: Array<{
    title: string;
    description?: string | null;
    location?: string | null;
    startsAt: string | Date;
    endsAt?: string | Date | null;
  }>;
}

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
      request.user?.sub ??
      request.user?.id ??
      request.user?.userId;

    if (!userId) {
      throw new BadRequestException(
        "Utente non autenticato",
      );
    }

    return userId;
  }

  @Get("association/:associationId")
  async findAllByAssociation(
    @Param("associationId") associationId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(request);

    return this.eventsService.findAll(
      associationId,
      userId,
    );
  }

  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(request);

    return this.eventsService.findOne(
      id,
      userId,
    );
  }

  @Post()
  async createEvent(
    @Body() dto: CreateEventDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(request);

    const startsAt = new Date(dto.startsAt);

    if (Number.isNaN(startsAt.getTime())) {
      throw new BadRequestException(
        "La data di inizio non è valida",
      );
    }

    const endsAt =
      dto.endsAt !== undefined &&
      dto.endsAt !== null
        ? new Date(dto.endsAt)
        : null;

    if (
      endsAt &&
      Number.isNaN(endsAt.getTime())
    ) {
      throw new BadRequestException(
        "La data di fine non è valida",
      );
    }

    return this.eventsService.createEvent(
      userId,
      {
        associationId: dto.associationId,
        title: dto.title,
        description: dto.description ?? null,
        location: dto.location ?? null,
        startsAt,
        endsAt,
      },
    );
  }

  @Post("import")
  async importEvents(
    @Body() dto: ImportEventDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(request);

    if (!Array.isArray(dto.events)) {
      throw new BadRequestException(
        "È necessario fornire un array di eventi",
      );
    }

    const events = dto.events.map((event) => {
      const startsAt = new Date(
        event.startsAt,
      );

      if (Number.isNaN(startsAt.getTime())) {
        throw new BadRequestException(
          `Data di inizio non valida per l'evento "${event.title}"`,
        );
      }

      const endsAt =
        event.endsAt !== undefined &&
        event.endsAt !== null
          ? new Date(event.endsAt)
          : null;

      if (
        endsAt &&
        Number.isNaN(endsAt.getTime())
      ) {
        throw new BadRequestException(
          `Data di fine non valida per l'evento "${event.title}"`,
        );
      }

      return {
        title: event.title,
        description: event.description ?? null,
        location: event.location ?? null,
        startsAt,
        endsAt,
      };
    });

    return this.eventsService.importEvents(
      userId,
      dto.associationId,
      events,
    );
  }

  @Patch(":id")
  async updateEvent(
    @Param("id") id: string,
    @Body() dto: UpdateEventDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(request);

    let startsAt: Date | undefined;

    if (dto.startsAt !== undefined) {
      startsAt = new Date(dto.startsAt);

      if (Number.isNaN(startsAt.getTime())) {
        throw new BadRequestException(
          "La data di inizio non è valida",
        );
      }
    }

    let endsAt: Date | null | undefined;

    if (dto.endsAt !== undefined) {
      endsAt =
        dto.endsAt === null
          ? null
          : new Date(dto.endsAt);

      if (
        endsAt &&
        Number.isNaN(endsAt.getTime())
      ) {
        throw new BadRequestException(
          "La data di fine non è valida",
        );
      }
    }

    return this.eventsService.updateEvent(
      id,
      userId,
      {
        ...(dto.title !== undefined
          ? { title: dto.title }
          : {}),
        ...(dto.description !== undefined
          ? {
              description: dto.description,
            }
          : {}),
        ...(dto.location !== undefined
          ? {
              location: dto.location,
            }
          : {}),
        ...(startsAt !== undefined
          ? { startsAt }
          : {}),
        ...(endsAt !== undefined
          ? { endsAt }
          : {}),
        ...(dto.capacity !== undefined
          ? { capacity: dto.capacity }
          : {}),
        ...(dto.registrationEnabled !== undefined
          ? { registrationEnabled: dto.registrationEnabled }
          : {}),
        ...(dto.status !== undefined
          ? { status: dto.status }
          : {}),
      },
    );
  }

  @Delete(":id")
  async deleteEvent(
    @Param("id") id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(request);

    return this.eventsService.deleteEvent(
      id,
      userId,
    );
  }

  @Post(":id/register")
  async register(
    @Param("id") id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(request);

    return this.eventsService.registerToEvent(
      id,
      userId,
    );
  }

  @Get(":id/registrations")
  async getRegistrations(
    @Param("id") id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(request);

    return this.eventsService.getRegistrations(
      id,
      userId,
    );
  }

  @Delete(
    ":id/registrations/:participantUserId",
  )
  async removeParticipant(
    @Param("id") id: string,
    @Param("participantUserId")
    participantUserId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(request);

    return this.eventsService.removeParticipant(
      id,
      participantUserId,
      userId,
    );
  }

  @Post(":id/registrations/:participantUserId/promote")
  async promoteParticipant(
    @Param("id") id: string,
    @Param("participantUserId") participantUserId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(request);

    return this.eventsService.promoteParticipant(
      id,
      participantUserId,
      userId,
    );
  }

  @Post(":id/registrations/:participantUserId/check-in")
  async checkInParticipant(
    @Param("id") id: string,
    @Param("participantUserId") participantUserId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(request);

    return this.eventsService.checkInParticipant(
      id,
      participantUserId,
      userId,
    );
  }

  @Delete(":id/registrations/:participantUserId/check-in")
  async undoCheckInParticipant(
    @Param("id") id: string,
    @Param("participantUserId") participantUserId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(request);

    return this.eventsService.undoCheckInParticipant(
      id,
      participantUserId,
      userId,
    );
  }

  @Delete(":id/register")
  async unregister(
    @Param("id") id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(request);

    return this.eventsService.unregisterFromEvent(
      id,
      userId,
    );
  }
}




