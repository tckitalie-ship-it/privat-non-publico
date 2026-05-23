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
import { JwtUser } from '../auth/jwt-user.interface';

import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationsService } from './invitations.service';

@Controller('invitations')
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: { user: JwtUser }) {
    return this.invitationsService.findAll(req.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: { user: JwtUser },
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationsService.create(req.user, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Req() req: { user: JwtUser },
    @Param('id') id: string,
  ) {
    return this.invitationsService.remove(req.user, id);
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard)
  accept(
    @Req() req: { user: JwtUser },
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.invitationsService.accept(req.user, dto.token);
  }
}