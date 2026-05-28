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

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateEventDto,
    @Req() req: any,
  ) {
    return this.eventsService.create({
      ...dto,
      associationId: req.user.associationId,
    });
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/register')
  register(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.eventsService.register(
      id,
      req.user.id,
    );
  }

  @Get(':id/registrations')
  registrations(@Param('id') id: string) {
    return this.eventsService.registrations(id);
  }

  @Delete(':id/register')
  unregister(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.eventsService.unregister(
      id,
      req.user.id,
    );
  }
}