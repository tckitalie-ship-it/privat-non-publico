import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AssociationsService } from './associations.service';
import { CreateAssociationDto } from './dto/create-association.dto';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
  };
};

@Controller('associations')
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAssociationDto,
  ) {
    return this.associationsService.create(req.user.id, dto);
  }
}