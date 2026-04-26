import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateEventDto) {
    return this.eventsService.create(req.user, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.eventsService.findAll(req.user);
  }
}