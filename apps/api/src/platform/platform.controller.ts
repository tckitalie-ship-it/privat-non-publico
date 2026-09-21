import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PlatformOwnerGuard } from "../auth/platform-owner.guard";
import { PlatformService } from "./platform.service";
import { CurrentUser } from "../auth/current-user.decorator";
import type { JwtUser } from "../auth/jwt-user.interface";
import { CreateAssociationDto } from "../associations/dto/create-association.dto";
import { UpdateAssociationDto } from "../associations/dto/update-association.dto";

@Controller("platform")
@UseGuards(JwtAuthGuard, PlatformOwnerGuard)
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get("associations")
  async findAllAssociations() {
    return this.platformService.findAllAssociations();
  }

  @Post("associations")
  async createAssociation(@Body() dto: CreateAssociationDto, @CurrentUser() user: JwtUser) {
    return this.platformService.createAssociation(dto, user.id);
  }

  @Get("associations/:id")
  async findAssociation(@Param("id") id: string) {
    return this.platformService.findAssociation(id);
  }

  @Get("associations/:id/members")
  async findAssociationMembers(@Param("id") id: string) {
    return this.platformService.findAssociationMembers(id);
  }

  @Get("associations/:id/members/:memberId")
  async findAssociationMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
  ) {
    return this.platformService.findAssociationMember(id, memberId);
  }

  @Patch("associations/:id/members/:memberId")
  async updateAssociationMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Body()
    dto: {
      firstName?: string;
      lastName?: string;
      memberNumber?: number | null;
      birthDate?: string | null;
      address?: string | null;
      phone?: string | null;
      role?: string;
    },
  ) {
    return this.platformService.updateAssociationMember(
      id,
      memberId,
      dto,
    );
  }

  @Patch("associations/:id")
  async updateAssociation(
    @Param("id") id: string,
    @Body() dto: UpdateAssociationDto,
  ) {
    return this.platformService.updateAssociation(id, dto);
  }

  @Patch("associations/:id/status")
  async setAssociationStatus(
    @Param("id") id: string,
    @Body() dto: { isActive: boolean },
  ) {
    return this.platformService.setAssociationStatus(id, dto.isActive);
  }
}




