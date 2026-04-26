import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: any, dto: CreateEventDto) {
    if (!user.associationId) {
      throw new BadRequestException(
        'No active association selected',
      );
    }

    if (
      user.role !== 'OWNER' &&
      user.role !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'Insufficient role',
      );
    }

    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt
          ? new Date(dto.endsAt)
          : null,
        associationId: user.associationId,
      },
    });
  }

  async findAll(user: any) {
    if (!user.associationId) {
      throw new BadRequestException(
        'No active association selected',
      );
    }

    return this.prisma.event.findMany({
      where: {
        associationId: user.associationId,
      },
      orderBy: {
        startsAt: 'asc',
      },
    });
  }
}