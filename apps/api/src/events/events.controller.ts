import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(@Req() req: any, @Body() dto: CreateEventDto) {
    return this.eventsService.create(req.user, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.eventsService.findAll(req.user);
  }

  @Post(':id/register')
  register(@Req() req: any, @Param('id') eventId: string) {
    return this.eventsService.register(req.user, eventId);
  }

  @Get(':id/registrations')
  @Roles('OWNER', 'ADMIN')
  findRegistrations(@Req() req: any, @Param('id') eventId: string) {
    return this.eventsService.findRegistrations(req.user, eventId);
  }

  @Delete(':id/register')
  unregister(@Req() req: any, @Param('id') eventId: string) {
    return this.eventsService.unregister(req.user, eventId);
  }
}