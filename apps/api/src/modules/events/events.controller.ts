import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/register')
  register(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.eventsService.register(id, userId);
  }

  @Get(':id/registrations')
  registrations(@Param('id') id: string) {
    return this.eventsService.registrations(id);
  }

  @Delete(':id/register')
  unregister(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.eventsService.unregister(id, userId);
  }
}