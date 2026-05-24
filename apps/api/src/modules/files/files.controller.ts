import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import {
  diskStorage,
} from 'multer';

import { extname } from 'path';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

import { FilesService } from './files.service';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination:
          './uploads',

        filename: (
          req,
          file,
          callback,
        ) => {
          const unique =
            `${Date.now()}-${Math.round(
              Math.random() *
                1e9,
            )}`;

          callback(
            null,
            `${unique}${extname(
              file.originalname,
            )}`,
          );
        },
      }),
    }),
  )
  async upload(
    @UploadedFile()
    file: Express.Multer.File,

    @Req()
    req: any,
  ) {
    return this.filesService.upload(
      {
        filename:
          file.filename,

        originalName:
          file.originalname,

        mimetype:
          file.mimetype,

        size: file.size,

        associationId:
          req.user
            .associationId,

        uploadedById:
          req.user.id,

        path: file.path,
      },
    );
  }

  @Get()
  async findAll(
    @Req()
    req: any,
  ) {
    return this.filesService.findAll(
      req.user
        .associationId,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id')
    id: string,
  ) {
    return this.filesService.findOne(
      id,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id')
    id: string,
  ) {
    return this.filesService.remove(
      id,
    );
  }
}