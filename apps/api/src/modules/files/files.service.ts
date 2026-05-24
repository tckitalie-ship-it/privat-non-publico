import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async upload(params: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    associationId: string;
    uploadedById: string;
    path: string;
  }) {
    return this.prisma.file.create({
      data: {
        filename: params.filename,

        originalName:
          params.originalName,

        mimetype:
          params.mimetype,

        size: params.size,

        associationId:
          params.associationId,

        uploadedById:
          params.uploadedById,

        path: params.path,
      },
    });
  }

  async findAll(
    associationId: string,
  ) {
    return this.prisma.file.findMany({
      where: {
        associationId,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const file =
      await this.prisma.file.findUnique(
        {
          where: { id },
        },
      );

    if (!file) {
      throw new NotFoundException(
        'File non trovato',
      );
    }

    return file;
  }

  async remove(id: string) {
    const file =
      await this.prisma.file.findUnique(
        {
          where: { id },
        },
      );

    if (!file) {
      throw new NotFoundException(
        'File non trovato',
      );
    }

    await this.prisma.file.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }
}