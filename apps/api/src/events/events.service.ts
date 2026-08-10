import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role } from "@prisma/client";

import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EventsService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly notificationsService: NotificationsService,
) {}

  async createEvent(
    userId: string,
    dto: {
      associationId: string;
      title: string;
      description?: string | null;
      startsAt: Date;
      endsAt?: Date | null;
      location?: string | null;
    },
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId: dto.associationId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Non sei membro di questa associazione",
      );
    }

    const event = await this.prisma.event.create({
  data: {
    associationId: dto.associationId,
    title: dto.title,
    description: dto.description ?? null,
    location: dto.location ?? null,
    startsAt: dto.startsAt,
    endsAt: dto.endsAt ?? null,
  },
});

await this.notificationsService.create({
  associationId: dto.associationId,
  title: "Nuovo evento creato",
  message: `È stato creato l'evento: ${event.title}`,
  userId: null,
});

return event;
  }

  async findAll(
    associationId: string,
    userId: string,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Non sei membro di questa associazione",
      );
    }

    return this.prisma.event.findMany({
      where: {
        associationId,
      },
      orderBy: {
        startsAt: "asc",
      },
      include: {
        registrations: true,
      },
    });
  }

  async findOne(
    eventId: string,
    userId: string,
  ) {
    const event =
      await this.prisma.event.findUnique({
        where: {
          id: eventId,
        },
        include: {
          registrations: true,
          association: true,
        },
      });

    if (!event) {
      throw new NotFoundException(
        "Evento non trovato",
      );
    }

    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId: event.associationId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Non sei membro di questa associazione",
      );
    }

    return event;
  }

  async updateEvent(
    eventId: string,
    userId: string,
    dto: {
      title?: string;
      description?: string | null;
      startsAt?: Date;
      endsAt?: Date | null;
      location?: string | null;
    },
  ) {
    const event =
      await this.prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

    if (!event) {
      throw new NotFoundException(
        "Evento non trovato",
      );
    }

    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId: event.associationId,
        },
      });

    if (
      !membership ||
      membership.role === Role.MEMBER
    ) {
      throw new ForbiddenException(
        "Non hai i permessi per modificare l’evento",
      );
    }

    const updatedEvent =
  await this.prisma.event.update({
    where: {
      id: eventId,
    },
    data: {
      title: dto.title,
      description: dto.description,
      location: dto.location,
      startsAt: dto.startsAt,
      endsAt: dto.endsAt,
    },
  });

await this.notificationsService.create({
  associationId: event.associationId,
  title: "Evento modificato",
  message: `È stato modificato l'evento: ${updatedEvent.title}`,
  userId: null,
});

return updatedEvent;
  }

  async deleteEvent(
    eventId: string,
    userId: string,
  ) {
    const event =
      await this.prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

    if (!event) {
      throw new NotFoundException(
        "Evento non trovato",
      );
    }

    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId: event.associationId,
        },
      });

    if (
      !membership ||
      membership.role === Role.MEMBER
    ) {
      throw new ForbiddenException(
        "Non hai i permessi per eliminare l’evento",
      );
    }

    await this.prisma.event.delete({
  where: {
    id: eventId,
  },
});

await this.notificationsService.create({
  associationId: event.associationId,
  title: "Evento eliminato",
  message: `È stato eliminato l'evento: ${event.title}`,
  userId: null,
});

return {
  message: "Evento eliminato",
};
  }

  async registerToEvent(
    eventId: string,
    userId: string,
  ) {
    const event =
      await this.prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

    if (!event) {
      throw new NotFoundException(
        "Evento non trovato",
      );
    }

    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId: event.associationId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Non sei membro di questa associazione",
      );
    }

    const existing =
      await this.prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
      });

    if (existing) {
      throw new BadRequestException(
        "Sei già registrato a questo evento",
      );
    }

    const registration =
  await this.prisma.eventRegistration.create({
    data: {
      eventId,
      userId,
    },
  });

await this.notificationsService.create({
  associationId: event.associationId,
  title: "Nuova partecipazione evento",
  message: `Un membro si è registrato all'evento: ${event.title}`,
  userId: null,
});

return registration;
  }

  async getRegistrations(
    eventId: string,
    userId: string,
  ) {
    const event =
      await this.prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

    if (!event) {
      throw new NotFoundException(
        "Evento non trovato",
      );
    }

    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId: event.associationId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Non sei membro di questa associazione",
      );
    }

    return this.prisma.eventRegistration.findMany({
      where: {
        eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async unregisterFromEvent(
    eventId: string,
    userId: string,
  ) {
    const event =
      await this.prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

    if (!event) {
      throw new NotFoundException(
        "Evento non trovato",
      );
    }

    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId: event.associationId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Non sei membro di questa associazione",
      );
    }

    const registration =
      await this.prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
      });

    if (!registration) {
      throw new BadRequestException(
        "Non sei registrato a questo evento",
      );
    }

    await this.prisma.eventRegistration.delete({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    return {
      success: true,
      message: "Registrazione annullata",
    };
  }
}
