import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { AssociationsService } from './associations.service';
import { CreateAssociationDto } from './dto/create-association.dto';

@Controller('associations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssociationsController {
  constructor(
    private readonly associationsService: AssociationsService,
  ) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateAssociationDto) {
    return this.associationsService.create(req.user.id, dto);
  }

  @Get('me')
  me(@Req() req: any) {
    return this.associationsService.me(req.user);
  }

  @Patch('me')
  @Roles('OWNER', 'ADMIN')
  updateMe(
    @Req() req: any,
    @Body()
    dto: {
      name?: string;
      slug?: string | null;
      description?: string | null;
    },
  ) {
    return this.associationsService.updateMe(req.user, dto);
  }

  @Post('me/logo')
  @Roles('OWNER', 'ADMIN')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${extname(file.originalname)}`;

          callback(null, uniqueName);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(new Error('Only image files are allowed'), false);
        }

        callback(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  uploadLogo(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const logoUrl = `/uploads/${file.filename}`;

    return this.associationsService.updateLogo(req.user, logoUrl);
  }

  @Patch(':id/active')
  @Roles('OWNER')
  setActive(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
    @Req() req: any,
  ) {
    return this.associationsService.setActive(
      id,
      body.isActive,
      req.user,
    );
  }
}