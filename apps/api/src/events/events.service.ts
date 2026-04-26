import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: any, dto: any) {
    if (!user.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    if (!['OWNER', 'ADMIN'].includes(user.role)) {
      throw new ForbiddenException('Only OWNER or ADMIN can create events');
    }

    return this.prisma.event.create({
      data: {
        associationId: user.associationId,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
    });
  }

  async findAll(user: any) {
    if (!user.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    return this.prisma.event.findMany({
      where: { associationId: user.associationId },
      orderBy: { startsAt: 'asc' },
    });
  }

  async register(user: any, eventId: string) {
    if (!user.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.associationId !== user.associationId) {
      throw new ForbiddenException();
    }

    const exists = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id,
        },
      },
    });

    if (exists) {
      throw new BadRequestException('Already registered');
    }

    return this.prisma.eventRegistration.create({
      data: {
        eventId,
        userId: user.id,
      },
    });
  }

  async registrations(user: any, eventId: string) {
    if (!user.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.associationId !== user.associationId) {
      throw new ForbiddenException();
    }

    return this.prisma.eventRegistration.findMany({
      where: { eventId },
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
}