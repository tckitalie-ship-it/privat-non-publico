import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";

import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { JwtUser } from "../auth/jwt-user.interface";

import { FilesService } from "./files.service";

type CreateFileDto = {
  url: string;
  name: string;
};

type UploadedDocument = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

@Controller("files")
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
  ) {}

  /**
   * Elenco file dell'associazione attiva.
   *
   * GET /api/files
   */
  @Get()
  async findAll(
    @CurrentUser() user: JwtUser,
  ) {
    if (!user.associationId) {
      throw new BadRequestException(
        "Nessuna associazione attiva selezionata",
      );
    }

    return this.filesService.getFilesForAssociation(
      user.associationId,
      user.id,
    );
  }

  /**
   * File caricati dall'utente autenticato.
   *
   * GET /api/files/mine
   */
  @Get("mine")
  async findMine(
    @CurrentUser() user: JwtUser,
  ) {
    return this.filesService.getFilesForUser(
      user.id,
    );
  }

  /**
   * Caricamento reale di un documento.
   *
   * POST /api/files/upload
   */
  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
      fileFilter: (
        _request,
        file,
        callback,
      ) => {
        if (
          !ALLOWED_MIME_TYPES.has(
            file.mimetype,
          )
        ) {
          callback(
            new BadRequestException(
              "Tipo di file non supportato",
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile()
    file: UploadedDocument | undefined,
    @CurrentUser() user: JwtUser,
  ) {
    if (!user.associationId) {
      throw new BadRequestException(
        "Nessuna associazione attiva selezionata",
      );
    }

    if (!file) {
      throw new BadRequestException(
        "Seleziona un file da caricare",
      );
    }

    return this.filesService.uploadBinaryFile({
      buffer: file.buffer,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      associationId:
        user.associationId,
      uploadedById: user.id,
    });
  }

  /**
   * Registra un documento disponibile tramite URL.
   *
   * POST /api/files
   */
  @Post()
  async createFromUrl(
    @Body() dto: CreateFileDto,
    @CurrentUser() user: JwtUser,
  ) {
    const name = dto.name?.trim();
    const url = dto.url?.trim();

    if (!name) {
      throw new BadRequestException(
        "Il nome del file è obbligatorio",
      );
    }

    if (!url) {
      throw new BadRequestException(
        "L'URL del file è obbligatorio",
      );
    }

    return this.filesService.uploadFile({
      name,
      url,
      associationId:
        user.associationId ?? null,
      uploadedById: user.id,
    });
  }

  /**
   * Download protetto del documento.
   *
   * GET /api/files/:id/download
   */
  @Get(":id/download")
  async download(
    @Param("id") id: string,
    @CurrentUser() user: JwtUser,
    @Res() response: Response,
  ) {
    const file =
      await this.filesService.getDownloadFile(
        id,
        user.id,
      );

    response.download(
      file.path,
      file.downloadName,
    );
  }

  /**
   * Dettaglio documento.
   *
   * GET /api/files/:id
   */
  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.filesService.findOne(
      id,
      user.id,
    );
  }

  /**
   * Eliminazione documento e file fisico.
   *
   * DELETE /api/files/:id
   */
  @Delete(":id")
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.filesService.deleteFile(
      id,
      user.id,
    );
  }
}