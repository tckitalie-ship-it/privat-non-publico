import { Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';

type FileRecord = {
  id: string;
  filename: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  path?: string;
  associationId?: string;
  uploadedById?: string;
  createdAt: Date;
};

@Injectable()
export class FilesService {
  private files: FileRecord[] = [];

  async create(data: {
    filename: string;
    originalName?: string;
    mimeType?: string;
    size?: number;
    path?: string;
    associationId?: string;
    uploadedById?: string;
  }) {
    const file: FileRecord = {
      id: crypto.randomUUID(),
      filename: data.filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      path: data.path,
      associationId: data.associationId,
      uploadedById: data.uploadedById,
      createdAt: new Date(),
    };

    this.files.push(file);

    return file;
  }

  async findAll(associationId?: string) {
    if (!associationId) {
      return this.files;
    }

    return this.files.filter((file) => file.associationId === associationId);
  }

  async findOne(id: string) {
    const file = this.files.find((item) => item.id === id);

    if (!file) {
      throw new NotFoundException('File non trovato');
    }

    return file;
  }

  async remove(id: string) {
    const file = await this.findOne(id);

    this.files = this.files.filter((item) => item.id !== id);

    return {
      deleted: true,
      file,
    };
  }
}