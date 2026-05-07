import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('memberships')
@UseGuards(JwtAuthGuard)
export class MembershipsController {
  constructor(private readonly service: MembershipsService) {}

  // GET tutti membri
  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.service.findAll(user);
  }

  // GET mio membership
  @Get('me')
  async me(@CurrentUser() user: any) {
    return this.service.me(user);
  }

  // PATCH cambia ruolo (solo OWNER)
  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async updateRole(
    @Param('id') id: string,
    @Body() body: { role: Role },
    @CurrentUser() user: any,
  ) {
    return this.service.updateRole(id, body.role, user);
  }

  // DELETE rimuovi membro (solo OWNER)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}