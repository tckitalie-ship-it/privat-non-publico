import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/jwt-user.interface';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client'; // ✅ QUI
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationsService } from './invitations.service';

@Controller('invitations')
@UseGuards(JwtAuthGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  create(
    @Req() req: { user: JwtUser },
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationsService.create(req.user, dto);
  }

  @Post('accept')
  accept(
    @Req() req: { user: JwtUser },
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.invitationsService.accept(req.user, dto.token);
  }
}