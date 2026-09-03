import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
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

  if (
    membership.role !== Role.OWNER &&
    membership.role !== Role.ADMIN
  ) {
    throw new ForbiddenException(
      "Non hai i permessi per creare eventi",
    );
  }

  return this.prisma.event.create({
    data: {
      associationId: dto.associationId,
      title: dto.title,
      description: dto.description ?? null,
      location: dto.location ?? null,
      startsAt: dto.startsAt,
      endsAt: dto.endsAt ?? null,
    },
  });
}
    async importEvents(
    userId: string,
    associationId: string,
    events: Array<{
      title: string;
      description?: string | null;
      startsAt: string;
      endsAt?: string | null;
    }>,
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

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        "Non hai i permessi per importare eventi",
      );
    }

    if (!Array.isArray(events) || events.length === 0) {
      throw new BadRequestException(
        "Nessun evento da importare",
      );
    }

    const createdEvents: Array<{
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: Date;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  associationId: string;
}> = [];

    for (const event of events) {
      if (!event.title || !event.startsAt) {
        throw new BadRequestException(
          "Ogni evento deve avere titolo e data di inizio",
        );
      }

      const startsAt = new Date(event.startsAt);

      const endsAt = event.endsAt
        ? new Date(event.endsAt)
        : null;

      if (Number.isNaN(startsAt.getTime())) {
        throw new BadRequestException(
          `Data di inizio non valida per "${event.title}"`,
        );
      }

      if (
        endsAt &&
        Number.isNaN(endsAt.getTime())
      ) {
        throw new BadRequestException(
          `Data di fine non valida per "${event.title}"`,
        );
      }

      const created =
        await this.prisma.event.create({
          data: {
            associationId,
            title: event.title,
            description:
              event.description ?? null,
            startsAt,
            endsAt,
          },
        });

      createdEvents.push(created);
    }

    return {
      success: true,
      imported: createdEvents.length,
      events: createdEvents,
    };
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

  console.log("[UPDATE EVENT DEBUG]", {
    eventId,
    userId,
    eventAssociationId: event.associationId,
    membershipId: membership?.id,
    membershipUserId: membership?.userId,
    membershipAssociationId:
      membership?.associationId,
    membershipRole: membership?.role,
  });

  if (!membership) {
    throw new ForbiddenException(
      "Non sei membro di questa associazione",
    );
  }

  if (
    membership.role !== Role.OWNER &&
    membership.role !== Role.ADMIN
  ) {
    throw new ForbiddenException(
      "Non hai i permessi per modificare l'evento",
    );
  }

  return this.prisma.event.update({
    where: {
      id: eventId,
    },
    data: {
      ...(dto.title !== undefined
        ? { title: dto.title }
        : {}),
      ...(dto.description !== undefined
        ? { description: dto.description }
        : {}),
      ...(dto.location !== undefined
        ? { location: dto.location }
        : {}),
      ...(dto.startsAt !== undefined
        ? { startsAt: dto.startsAt }
        : {}),
      ...(dto.endsAt !== undefined
        ? { endsAt: dto.endsAt }
        : {}),
    },
  });
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
      (
        membership.role !== Role.OWNER &&
        membership.role !== Role.ADMIN
      )
    ) {
      throw new ForbiddenException(
        "Non hai i permessi per eliminare l'evento",
      );
    }

    await this.prisma.event.delete({
      where: {
        id: eventId,
      },
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

    return this.prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
      },
    });
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