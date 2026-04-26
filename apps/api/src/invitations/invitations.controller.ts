import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Controller('invitations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
  ) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateInvitationDto) {
    return this.invitationsService.create(req.user, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.invitationsService.findAll(req.user);
  }

  @Post('accept')
  accept(
    @Req() req: any,
    @Body() body: { token: string },
  ) {
    return this.invitationsService.accept(
      req.user,
      body.token,
    );
  }
}