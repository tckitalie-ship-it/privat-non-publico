import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationsService } from './invitations.service';

@Controller('invitations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(@Req() req: any, @Body() dto: CreateInvitationDto) {
    return this.invitationsService.create(req.user, dto);
  }

  @Get()
  @Roles('OWNER', 'ADMIN')
  findAll(@Req() req: any) {
    return this.invitationsService.findAll(req.user);
  }

  @Post('accept')
  accept(@Req() req: any, @Body() body: { token: string }) {
    return this.invitationsService.accept(req.user, body.token);
  }
}