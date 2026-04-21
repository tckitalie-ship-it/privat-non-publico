import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/.types/jwt-user.type';
import { AssociationsService } from './associations.service';
import { CreateAssociationDto } from './dto/create-association.dto';

@Controller('associations')
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
@CurrentUser() user: JwtUser,
    @Body() dto: CreateAssociationDto,
  ) {
    return this.associationsService.create(user.sub, dto);
  }
}