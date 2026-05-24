import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  findAll() {
    return this.prisma.event.findMany({
      orderBy: {
        startsAt: 'asc',
      },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async create(dto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: {
        associationId: dto.associationId,
        title: dto.title,
        description: dto.description || null,
        location: dto.location || null,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
      include: {
        registrations: true,
      },
    });

    await this.notificationsService.create({
      associationId: dto.associationId,
      title: 'Nuovo evento creato',
      message: `È stato creato l’evento: ${event.title}`,
      userId: null,
    });

    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Evento non trovato');
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      },
      include: {
        registrations: true,
      },
    });
  }

  async remove(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Evento non trovato');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }

  async register(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('Evento non trovato');
    }

    const registration = await this.prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
      },
    });

    await this.notificationsService.create({
      associationId: event.associationId,
      title: 'Nuova partecipazione evento',
      message: `Un membro si è registrato all’evento: ${event.title}`,
      userId: null,
    });

    return registration;
  }

  registrations(eventId: string) {
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

  async unregister(eventId: string, userId: string) {
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
    };
  }
}