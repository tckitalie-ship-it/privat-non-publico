import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

import { CreateEventDto } from './dto/create-event.dto';
import { EventsGateway } from './events.gateway';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(currentUser: any, dto: CreateEventDto) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    const event = await this.prisma.event.create({
      data: {
        associationId: currentUser.associationId,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
    });

    await this.notificationsService.create({
      title: 'Nuovo evento',
      message: `${event.title} è stato creato`,
      associationId: currentUser.associationId,
      userId: null,
    });

    this.eventsGateway.emitEventsChanged('Nuovo evento creato');

    return event;
  }

  async findAll(currentUser: any) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    const events = await this.prisma.event.findMany({
      where: {
        associationId: currentUser.associationId,
      },
      orderBy: {
        startsAt: 'asc',
      },
      include: {
        registrations: {
          select: {
            userId: true,
          },
        },
      },
    });

    return events.map((event) => ({
      id: event.id,
      associationId: event.associationId,
      title: event.title,
      description: event.description,
      location: event.location,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      registrationsCount: event.registrations.length,
      isRegistered: event.registrations.some(
        (registration) => registration.userId === currentUser.id,
      ),
    }));
  }

  async update(currentUser: any, eventId: string, dto: CreateEventDto) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.associationId !== currentUser.associationId) {
      throw new ForbiddenException('Wrong association');
    }

    const updatedEvent = await this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
    });

    this.eventsGateway.emitEventsChanged('Evento aggiornato');

    return updatedEvent;
  }

  async remove(currentUser: any, eventId: string) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.associationId !== currentUser.associationId) {
      throw new ForbiddenException('Wrong association');
    }

    await this.prisma.event.delete({
      where: {
        id: eventId,
      },
    });

    this.eventsGateway.emitEventsChanged('Evento eliminato');

    return {
      success: true,
    };
  }

  async register(currentUser: any, eventId: string) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.associationId !== currentUser.associationId) {
      throw new ForbiddenException('Wrong association');
    }

    const existing = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: currentUser.id,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Already registered');
    }

    const registration = await this.prisma.eventRegistration.create({
      data: {
        eventId,
        userId: currentUser.id,
      },
    });

    this.eventsGateway.emitEventsChanged('Nuova registrazione evento');

    return registration;
  }

  async findRegistrations(currentUser: any, eventId: string) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.associationId !== currentUser.associationId) {
      throw new ForbiddenException('Wrong association');
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
    });
  }

  async unregister(currentUser: any, eventId: string) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.associationId !== currentUser.associationId) {
      throw new ForbiddenException('Wrong association');
    }

    const registration = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: currentUser.id,
        },
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    await this.prisma.eventRegistration.delete({
      where: {
        eventId_userId: {
          eventId,
          userId: currentUser.id,
        },
      },
    });

    this.eventsGateway.emitEventsChanged('Registrazione annullata');

    return {
      success: true,
    };
  }
}