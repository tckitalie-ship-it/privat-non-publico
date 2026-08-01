import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AssociationsService } from './associations.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';

@Controller('associations')
@UseGuards(JwtAuthGuard)
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @Get()
  async findAll(@Req() req) {
    return this.associationsService.findAllForUser(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.associationsService.findOneForUser(id, req.user.id);
  }

  @Post()
  async create(@Body() dto: CreateAssociationDto, @Req() req) {
    return this.associationsService.create(dto, req.user.id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAssociationDto, @Req() req) {
    return this.associationsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    return this.associationsService.remove(id, req.user.id);
  }
}
