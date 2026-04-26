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
import { RolesGuard } from '../auth/roles.guard';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

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

  @Post(':id/register')
  register(@Req() req: any, @Param('id') id: string) {
    return this.eventsService.register(req.user, id);
  }

  @Get(':id/registrations')
  registrations(@Req() req: any, @Param('id') id: string) {
    return this.eventsService.registrations(req.user, id);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.eventsService.update(req.user, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.eventsService.remove(req.user, id);
  }
}