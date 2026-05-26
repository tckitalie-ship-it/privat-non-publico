import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AssociationsService } from './associations.service';
import { CreateAssociationDto } from './dto/create-association.dto';

@Controller('associations')
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() dto: CreateAssociationDto) {
    return this.associationsService.create(req.user.id, dto);
  }

  @Patch(':id/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  setActive(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
    @Req() req: any,
  ) {
    return this.associationsService.setActive(id, body.isActive, req.user);
  }
}