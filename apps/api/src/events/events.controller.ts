import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateEventDto) {
    const user = req.user || {
      id: 'test-user',
      email: 'test@example.com',
      associationId: 'cmocnwz0f00009ktt50kibswl',
      role: 'OWNER',
    };

    return this.eventsService.create(user, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    const user = req.user || {
      id: 'test-user',
      email: 'test@example.com',
      associationId: 'cmocnwz0f00009ktt50kibswl',
      role: 'OWNER',
    };

    return this.eventsService.findAll(user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  update(
    @Req() req: any,
    @Param('id') eventId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.update(req.user, eventId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  remove(@Req() req: any, @Param('id') eventId: string) {
    return this.eventsService.remove(req.user, eventId);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  register(@Req() req: any, @Param('id') eventId: string) {
    return this.eventsService.register(req.user, eventId);
  }

  @Get(':id/registrations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  findRegistrations(@Req() req: any, @Param('id') eventId: string) {
    return this.eventsService.findRegistrations(req.user, eventId);
  }

  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  unregister(@Req() req: any, @Param('id') eventId: string) {
    return this.eventsService.unregister(req.user, eventId);
  }
}