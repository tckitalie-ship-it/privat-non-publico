import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventStatus, Prisma, Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsGateway } from "../notifications/notifications.gateway";

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  private async notifyEventCreated(event: {
    id: string;
    associationId: string;
    title: string;
    startsAt: Date;
    location?: string | null;
  }) {
    const members = await this.prisma.membership.findMany({
      where: {
        associationId: event.associationId,
      },
      select: {
        userId: true,
      },
    });

    if (members.length === 0) {
      return;
    }

    const date = event.startsAt.toLocaleString("it-IT", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const message = [
      `È stato creato un nuovo evento: ${event.title}.`,
      `Data: ${date}.`,
      event.location ? `Luogo: ${event.location}.` : null,
    ]
      .filter(Boolean)
      .join(" ");

    const userIds = [...new Set(members.map((member) => member.userId))];

    const existing = await this.prisma.notification.findMany({
      where: {
        associationId: event.associationId,
        userId: {
          in: userIds,
        },
        title: "Nuovo evento",
        message,
      },
      select: {
        userId: true,
      },
    });

    const existingUserIds = new Set(
      existing
        .map((notification) => notification.userId)
        .filter((userId): userId is string => Boolean(userId)),
    );

    const data = userIds
      .filter((userId) => !existingUserIds.has(userId))
      .map((userId) => ({
        title: "Nuovo evento",
        message,
        read: false,
        associationId: event.associationId,
        userId,
      }));

    if (data.length === 0) {
      return;
    }

    const created = await this.prisma.$transaction(
      data.map((item) => this.prisma.notification.create({ data: item })),
    );

    for (const notification of created) {
      NotificationsGateway.emitNotification(notification);
    }
  }

  private async notifyEventUpdated(event: {
    id: string;
    associationId: string;
    title: string;
    startsAt: Date;
    location?: string | null;
  }) {
    const members = await this.prisma.membership.findMany({
      where: { associationId: event.associationId },
      select: { userId: true },
    });

    const userIds = [...new Set(members.map((member) => member.userId))];
    if (userIds.length === 0) return;

    const date = event.startsAt.toLocaleString("it-IT", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const message = [
      `L'evento "${event.title}" è stato modificato.`,
      `Data: ${date}.`,
      event.location ? `Luogo: ${event.location}.` : null,
    ]
      .filter(Boolean)
      .join(" ");

    const existing = await this.prisma.notification.findMany({
      where: {
        associationId: event.associationId,
        userId: { in: userIds },
        title: "Evento modificato",
        message,
      },
      select: { userId: true },
    });

    const existingUserIds = new Set(
      existing
        .map((notification) => notification.userId)
        .filter((userId): userId is string => Boolean(userId)),
    );

    const data = userIds
      .filter((userId) => !existingUserIds.has(userId))
      .map((userId) => ({
        title: "Evento modificato",
        message,
        read: false,
        associationId: event.associationId,
        userId,
      }));

    if (data.length === 0) return;

    const created = await this.prisma.$transaction(
      data.map((item) => this.prisma.notification.create({ data: item })),
    );

    for (const notification of created) {
      NotificationsGateway.emitNotification(notification);
    }
  }

  private async notifyEventRegistration(
    event: {
      id: string;
      associationId: string;
      title: string;
      startsAt: Date;
      location?: string | null;
    },
    participantUserId: string,
    registrationStatus: string,
  ) {
    const managers = await this.prisma.membership.findMany({
      where: {
        associationId: event.associationId,
        role: { in: [Role.OWNER, Role.ADMIN] },
      },
      select: { userId: true },
    });

    const userIds = [...new Set(
      managers
        .map((member) => member.userId)
        .filter((id) => id !== participantUserId),
    )];

    if (userIds.length === 0) return;

    const participant = await this.prisma.user.findUnique({
      where: { id: participantUserId },
      select: { email: true },
    });

    const participantName =
      participant?.email || "Un membro";

    const date = event.startsAt.toLocaleString("it-IT", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const isWaitlisted = registrationStatus === "WAITLISTED";

    const title = isWaitlisted
      ? "Lista d'attesa"
      : "Nuova partecipazione";

    const message = [
      isWaitlisted
        ? `${participantName} è entrato nella lista d'attesa dell'evento "${event.title}".`
        : `${participantName} si è registrato all'evento "${event.title}".`,
      `Data: ${date}.`,
      event.location ? `Luogo: ${event.location}.` : null,
    ]
      .filter(Boolean)
      .join(" ");

    const existing = await this.prisma.notification.findMany({
      where: {
        associationId: event.associationId,
        userId: { in: userIds },
        title,
        message,
      },
      select: { userId: true },
    });

    const existingUserIds = new Set(
      existing
        .map((notification) => notification.userId)
        .filter((id): id is string => Boolean(id)),
    );

    const data = userIds
      .filter((id) => !existingUserIds.has(id))
      .map((id) => ({
        title,
        message,
        read: false,
        associationId: event.associationId,
        userId: id,
      }));

    if (data.length === 0) return;

    const created = await this.prisma.$transaction(
      data.map((item) => this.prisma.notification.create({ data: item })),
    );

    for (const notification of created) {
      NotificationsGateway.emitNotification(notification);
    }
  }

  private async notifyEventUnregistration(
    event: {
      id: string;
      associationId: string;
      title: string;
      startsAt: Date;
      location?: string | null;
    },
    participantUserId: string,
  ) {
    const managers = await this.prisma.membership.findMany({
      where: {
        associationId: event.associationId,
        role: { in: [Role.OWNER, Role.ADMIN] },
      },
      select: { userId: true },
    });

    const userIds = [...new Set(
      managers
        .map((member) => member.userId)
        .filter((id) => id !== participantUserId),
    )];

    if (userIds.length === 0) return;

    const participant = await this.prisma.user.findUnique({
      where: { id: participantUserId },
      select: { email: true },
    });

    const participantName = participant?.email || "Un membro";

    const date = event.startsAt.toLocaleString("it-IT", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const message = [
      `${participantName} ha annullato la partecipazione all'evento "${event.title}".`,
      `Data: ${date}.`,
      event.location ? `Luogo: ${event.location}.` : null,
    ]
      .filter(Boolean)
      .join(" ");

    const existing = await this.prisma.notification.findMany({
      where: {
        associationId: event.associationId,
        userId: { in: userIds },
        title: "Partecipazione annullata",
        message,
      },
      select: { userId: true },
    });

    const existingUserIds = new Set(
      existing
        .map((notification) => notification.userId)
        .filter((id): id is string => Boolean(id)),
    );

    const data = userIds
      .filter((id) => !existingUserIds.has(id))
      .map((id) => ({
        title: "Partecipazione annullata",
        message,
        read: false,
        associationId: event.associationId,
        userId: id,
      }));

    if (data.length === 0) return;

    const created = await this.prisma.$transaction(
      data.map((item) => this.prisma.notification.create({ data: item })),
    );

    for (const notification of created) {
      NotificationsGateway.emitNotification(notification);
    }
  }

  private validateEventDates(
    startsAt: Date,
    endsAt?: Date | null,
  ) {
    if (
      !(startsAt instanceof Date) ||
      Number.isNaN(startsAt.getTime())
    ) {
      throw new BadRequestException(
        "Data di inizio non valida",
      );
    }

    if (
      endsAt &&
      (!(endsAt instanceof Date) ||
        Number.isNaN(endsAt.getTime()))
    ) {
      throw new BadRequestException(
        "Data di fine non valida",
      );
    }

    if (
      endsAt &&
      endsAt.getTime() <= startsAt.getTime()
    ) {
      throw new BadRequestException(
        "La data di fine deve essere successiva alla data di inizio",
      );
    }
  }

  async createEvent(
    userId: string,
    dto: {
      associationId: string;
      title: string;
      description?: string | null;
      location?: string | null;
      startsAt: Date;
      endsAt?: Date | null;
      capacity?: number | null;
      registrationEnabled?: boolean;
      status?: EventStatus;
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

    const title = dto.title?.trim();

    if (!title) {
      throw new BadRequestException(
        "Il titolo dell'evento è obbligatorio",
      );
    }

    const description =
      dto.description?.trim() || null;

    const location =
      dto.location?.trim() || null;

    this.validateEventDates(
      dto.startsAt,
      dto.endsAt,
    );

    const createdEvent = await this.prisma.event.create({
      data: {
        associationId: dto.associationId,
        title,
        description,
        location,
        startsAt: dto.startsAt,
        endsAt: dto.endsAt ?? null,
        capacity: dto.capacity ?? null,
        registrationEnabled: dto.registrationEnabled ?? true,
        status: dto.status ?? EventStatus.SCHEDULED,
      },
    });

    await this.notifyEventCreated(createdEvent);

    return createdEvent;
  }

  async importEvents(
    userId: string,
    associationId: string,
    events: Array<{
      title: string;
      description?: string | null;
      location?: string | null;
      startsAt: string | Date;
      endsAt?: string | Date | null;
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

    return this.prisma.$transaction(async (tx) => {
      const createdEvents: Awaited<ReturnType<typeof tx.event.create>>[] = [];

      for (const item of events) {
        const title = item.title?.trim();

        if (!title) {
          throw new BadRequestException(
            "Ogni evento importato deve avere un titolo",
          );
        }

        if (!item.startsAt) {
          throw new BadRequestException(
            `L'evento "${title}" non ha una data di inizio`,
          );
        }

        const startsAt =
          item.startsAt instanceof Date
            ? item.startsAt
            : new Date(item.startsAt);

        const endsAt =
          item.endsAt === null ||
          item.endsAt === undefined ||
          item.endsAt === ""
            ? null
            : item.endsAt instanceof Date
              ? item.endsAt
              : new Date(item.endsAt);

        this.validateEventDates(
          startsAt,
          endsAt,
        );

        const description =
          item.description?.trim() || null;

        const location =
          item.location?.trim() || null;

        const createdEvent =
          await tx.event.create({
            data: {
              associationId,
              title,
              description,
              location,
              startsAt,
              endsAt,
            },
          });

        createdEvents.push(createdEvent);
      }

      return {
        success: true,
        count: createdEvents.length,
        events: createdEvents,
      };
    });
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

    const events = await this.prisma.event.findMany({
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

    return events.map((event) => ({
      ...event,
      participantCount: event.registrations.filter(
        (registration) => registration.status === "REGISTERED",
      ).length,
      waitlistCount: event.registrations.filter(
        (registration) => registration.status === "WAITLISTED",
      ).length,
    }));
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

    return this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        registrations: true,
        association: true,
      },
    });
  }

  async updateEvent(
    eventId: string,
    userId: string,
    dto: {
      title?: string;
      description?: string | null;
      location?: string | null;
      startsAt?: Date;
      endsAt?: Date | null;
      capacity?: number | null;
      registrationEnabled?: boolean;
      status?: EventStatus;
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
        "Non hai i permessi per modificare eventi",
      );
    }

    const startsAt =
      dto.startsAt ?? event.startsAt;

    const endsAt =
      dto.endsAt !== undefined
        ? dto.endsAt
        : event.endsAt;

    this.validateEventDates(
      startsAt,
      endsAt,
    );

    let title: string | undefined;

    if (dto.title !== undefined) {
      title = dto.title.trim();

      if (!title) {
        throw new BadRequestException(
          "Il titolo dell'evento è obbligatorio",
        );
      }
    }

    const updatedEvent = await this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        ...(title !== undefined
          ? { title }
          : {}),
        ...(dto.description !== undefined
          ? {
              description:
                dto.description?.trim() || null,
            }
          : {}),
        ...(dto.location !== undefined
          ? {
              location:
                dto.location?.trim() || null,
            }
          : {}),
        ...(dto.startsAt !== undefined
          ? { startsAt }
          : {}),
        ...(dto.endsAt !== undefined
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
    });

    await this.notifyEventUpdated(updatedEvent);

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
        "Non hai i permessi per eliminare eventi",
      );
    }

    await this.prisma.event.delete({
      where: {
        id: eventId,
      },
    });

    return {
      success: true,
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

    if (!event.registrationEnabled) {
      throw new BadRequestException(
        "Le iscrizioni a questo evento sono disabilitate",
      );
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException(
        "Non è possibile iscriversi a un evento cancellato",
      );
    }

    if (event.status === EventStatus.COMPLETED) {
      throw new BadRequestException(
        "Non è possibile iscriversi a un evento completato",
      );
    }

    const existingRegistration =
      await this.prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
      });

    if (existingRegistration) {
      throw new BadRequestException(
        "Sei già registrato a questo evento",
      );
    }

    let status = "REGISTERED";

    if (event.capacity !== null && event.capacity !== undefined) {
      const registrationCount =
        await this.prisma.eventRegistration.count({
          where: {
            eventId,
            status: "REGISTERED",
          },
        });

      if (registrationCount >= event.capacity) {
        status = "WAITLISTED";
      }
    }

    try {
      const registration = await this.prisma.eventRegistration.create({
        data: {
          eventId,
          userId,
          status,
        },
      });

      await this.notifyEventRegistration(event, userId, status);

      return registration;
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException(
          "Sei già registrato a questo evento",
        );
      }

      throw error;
    }
  }
  private async promoteNextWaitlisted(eventId: string) {
    const nextWaitlisted =
      await this.prisma.eventRegistration.findFirst({
        where: {
          eventId,
          status: "WAITLISTED",
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    if (!nextWaitlisted) {
      return null;
    }

    const promoted =
      await this.prisma.eventRegistration.update({
        where: {
          id: nextWaitlisted.id,
        },
        data: {
          status: "REGISTERED",
        },
        include: {
          event: {
            select: {
              id: true,
              associationId: true,
              title: true,
              startsAt: true,
              location: true,
            },
          },
        },
      });

    await this.notifyWaitlistPromotion(
      promoted.event,
      promoted.userId,
    );

    return promoted;
  }

  private async notifyWaitlistPromotion(
    event: {
      id: string;
      associationId: string;
      title: string;
      startsAt: Date;
      location?: string | null;
    },
    userId: string,
  ) {
    const date = event.startsAt.toLocaleString("it-IT", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const message = [
      `Sei stato promosso dalla lista d'attesa e sei ora registrato all'evento "${event.title}".`,
      `Data: ${date}.`,
      event.location ? `Luogo: ${event.location}.` : null,
    ]
      .filter(Boolean)
      .join(" ");

    const existing = await this.prisma.notification.findFirst({
      where: {
        associationId: event.associationId,
        userId,
        title: "Posto disponibile",
        message,
      },
    });

    if (existing) {
      return;
    }

    const notification =
      await this.prisma.notification.create({
        data: {
          title: "Posto disponibile",
          message,
          read: false,
          associationId: event.associationId,
          userId,
        },
      });

    NotificationsGateway.emitNotification(notification);
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

    const registrations =
      await this.prisma.eventRegistration.findMany({
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

    const participantMemberships =
      await this.prisma.membership.findMany({
        where: {
          associationId: event.associationId,
          userId: {
            in: registrations.map(
              (registration) => registration.userId,
            ),
          },
        },
        select: {
          userId: true,
          memberNumber: true,
          firstName: true,
          lastName: true,
        },
      });

    const membershipByUserId = new Map(
      participantMemberships.map((item) => [
        item.userId,
        item,
      ]),
    );

    return registrations.map((registration) => {
      const participantMembership =
        membershipByUserId.get(
          registration.userId,
        );

      return {
        ...registration,
        membership: participantMembership
          ? {
              memberNumber:
                participantMembership.memberNumber,
              firstName:
                participantMembership.firstName,
              lastName:
                participantMembership.lastName,
            }
          : null,
      };
    });
  }

  async checkInParticipant(
    eventId: string,
    participantUserId: string,
    userId: string,
  ) {
    const event = await this.prisma.event.findUnique({
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

    if (
      membership.role !== "OWNER" &&
      membership.role !== "ADMIN"
    ) {
      throw new ForbiddenException(
        "Non hai i permessi per effettuare il check-in",
      );
    }

    const registration =
      await this.prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: participantUserId,
          },
        },
      });

    if (!registration) {
      throw new NotFoundException(
        "Il partecipante non ? iscritto a questo evento",
      );
    }

    return this.prisma.eventRegistration.update({
      where: {
        id: registration.id,
      },
      data: {
        checkedInAt: new Date(),
      },
    });
  }

  async undoCheckInParticipant(
    eventId: string,
    participantUserId: string,
    userId: string,
  ) {
    const event = await this.prisma.event.findUnique({
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

    if (
      membership.role !== "OWNER" &&
      membership.role !== "ADMIN"
    ) {
      throw new ForbiddenException(
        "Non hai i permessi per modificare il check-in",
      );
    }

    const registration =
      await this.prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: participantUserId,
          },
        },
      });

    if (!registration) {
      throw new NotFoundException(
        "Il partecipante non ? iscritto a questo evento",
      );
    }

    return this.prisma.eventRegistration.update({
      where: {
        id: registration.id,
      },
      data: {
        checkedInAt: null,
      },
    });
  }

  private async notifyParticipantRemoved(
    event: {
      id: string;
      associationId: string;
      title: string;
      startsAt: Date;
      location?: string | null;
    },
    participantUserId: string,
  ) {
    const participant = await this.prisma.user.findUnique({
      where: { id: participantUserId },
      select: { email: true },
    });

    if (!participant) return;

    const date = event.startsAt.toLocaleString("it-IT", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const message = [
      `La tua partecipazione all'evento "${event.title}" è stata rimossa.`,
      `Data: ${date}.`,
      event.location ? `Luogo: ${event.location}.` : null,
    ]
      .filter(Boolean)
      .join(" ");

    const existing = await this.prisma.notification.findFirst({
      where: {
        associationId: event.associationId,
        userId: participantUserId,
        title: "Partecipazione rimossa",
        message,
      },
      select: { id: true },
    });

    if (existing) return;

    const notification = await this.prisma.notification.create({
      data: {
        title: "Partecipazione rimossa",
        message,
        read: false,
        associationId: event.associationId,
        userId: participantUserId,
      },
    });

    NotificationsGateway.emitNotification(notification);
  }

  async promoteParticipant(
    eventId: string,
    participantUserId: string,
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

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        "Non hai i permessi per gestire i partecipanti",
      );
    }

    if (
      event.status === EventStatus.CANCELLED ||
      event.status === EventStatus.COMPLETED
    ) {
      throw new BadRequestException(
        "Non è possibile promuovere partecipanti da un evento non attivo",
      );
    }

    const registration =
      await this.prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: participantUserId,
          },
        },
      });

    if (!registration) {
      throw new NotFoundException(
        "Partecipante non registrato a questo evento",
      );
    }

    if (registration.status !== "WAITLISTED") {
      throw new BadRequestException(
        "Il partecipante non è nella lista d'attesa",
      );
    }

    if (
      event.capacity !== null &&
      event.capacity !== undefined
    ) {
      const registeredCount =
        await this.prisma.eventRegistration.count({
          where: {
            eventId,
            status: "REGISTERED",
          },
        });

      if (registeredCount >= event.capacity) {
        throw new BadRequestException(
          "Non ci sono posti disponibili per la promozione",
        );
      }
    }

    const promoted =
      await this.prisma.eventRegistration.update({
        where: {
          id: registration.id,
        },
        data: {
          status: "REGISTERED",
        },
      });

    await this.notifyWaitlistPromotion(
      event,
      participantUserId,
    );

    return {
      success: true,
      message:
        "Partecipante promosso dalla lista d'attesa",
      registration: promoted,
    };
  }
  async removeParticipant(
    eventId: string,
    participantUserId: string,
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

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        "Non hai i permessi per gestire i partecipanti",
      );
    }

    const registration =
      await this.prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: participantUserId,
          },
        },
      });

    if (!registration) {
      throw new NotFoundException(
        "Partecipante non registrato a questo evento",
      );
    }

    await this.prisma.eventRegistration.delete({
      where: {
        eventId_userId: {
          eventId,
          userId: participantUserId,
        },
      },
    });

    if (registration.status === "REGISTERED") {
      await this.promoteNextWaitlisted(eventId);
    }

    await this.notifyParticipantRemoved(
      event,
      participantUserId,
    );

    return {
      success: true,
      message: "Partecipante rimosso dall'evento",
    };
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

    if (registration.status === "REGISTERED") {
      await this.promoteNextWaitlisted(eventId);
    }

    await this.notifyEventUnregistration(event, userId);

    return {
      success: true,
      message: "Registrazione annullata",
    };
  }
}
