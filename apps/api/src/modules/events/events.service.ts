import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
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

  create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        associationId:
          dto.associationId,
        title: dto.title,
        description:
          dto.description || null,
        location:
          dto.location || null,
        startsAt: new Date(
          dto.startsAt,
        ),
        endsAt: dto.endsAt
          ? new Date(dto.endsAt)
          : null,
      },
      include: {
        registrations: true,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateEventDto,
  ) {
    const event =
      await this.prisma.event.findUnique(
        {
          where: { id },
        },
      );

    if (!event) {
      throw new NotFoundException(
        'Evento non trovato',
      );
    }

    return this.prisma.event.update({
      where: { id },

      data: {
        title: dto.title,
        description:
          dto.description,
        location: dto.location,

        startsAt: dto.startsAt
          ? new Date(dto.startsAt)
          : undefined,

        endsAt: dto.endsAt
          ? new Date(dto.endsAt)
          : undefined,
      },

      include: {
        registrations: true,
      },
    });
  }

  async remove(id: string) {
    const event =
      await this.prisma.event.findUnique(
        {
          where: { id },
        },
      );

    if (!event) {
      throw new NotFoundException(
        'Evento non trovato',
      );
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }

  async register(
    eventId: string,
    userId: string,
  ) {
    const event =
      await this.prisma.event.findUnique(
        {
          where: {
            id: eventId,
          },
        },
      );

    if (!event) {
      throw new NotFoundException(
        'Evento non trovato',
      );
    }

    return this.prisma.eventRegistration.create(
      {
        data: {
          eventId,
          userId,
        },
      },
    );
  }

  registrations(eventId: string) {
    return this.prisma.eventRegistration.findMany(
      {
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
      },
    );
  }

  async unregister(
    eventId: string,
    userId: string,
  ) {
    await this.prisma.eventRegistration.delete(
      {
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
      },
    );

    return {
      success: true,
    };
  }
}