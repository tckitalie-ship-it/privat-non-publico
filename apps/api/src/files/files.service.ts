import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { randomUUID } from "crypto";
import {
  access,
  mkdir,
  unlink,
  writeFile,
} from "fs/promises";
import { extname, join } from "path";

import { PrismaService } from "../prisma/prisma.service";

type UploadBinaryFileInput = {
  buffer: Buffer;
  originalName: string;
  mimetype: string;
  size: number;
  associationId: string;
  uploadedById: string;
};

@Injectable()
export class FilesService {
  private readonly uploadsDirectory =
    join(process.cwd(), "uploads");

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Verifica l'appartenenza all'associazione.
   * Tutti i membri possono leggere i file.
   */
  private async ensureMembership(
    userId: string,
    associationId: string,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Non sei membro di questa associazione",
      );
    }

    return membership;
  }

  /**
   * Verifica i permessi di gestione dei file.
   * Solo OWNER e ADMIN possono caricare/eliminare.
   */
  private async ensureCanManageFiles(
    userId: string,
    associationId: string,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Non sei membro di questa associazione",
      );
    }

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        "Non hai i permessi per gestire i file",
      );
    }

    return membership;
  }

  /**
   * Crea automaticamente la cartella uploads.
   */
  private async ensureUploadsDirectory() {
    await mkdir(this.uploadsDirectory, {
      recursive: true,
    });
  }

  /**
   * Crea un nome sicuro per il file fisico.
   */
  private createStoredFilename(
    originalName: string,
  ) {
    const extension = extname(
      originalName,
    ).toLowerCase();

    return `${randomUUID()}${extension}`;
  }

  /**
   * Carica realmente un file sul disco
   * e registra i metadati nel database.
   */
  async uploadBinaryFile(
    input: UploadBinaryFileInput,
  ) {
    await this.ensureCanManageFiles(
      input.uploadedById,
      input.associationId,
    );

    await this.ensureUploadsDirectory();

    const id = randomUUID();

    const storedFilename =
      this.createStoredFilename(
        input.originalName,
      );

    const filePath = join(
      this.uploadsDirectory,
      storedFilename,
    );

    await writeFile(
      filePath,
      input.buffer,
    );

    try {
      return await this.prisma.file.create({
        data: {
          id,
          name: input.originalName,
          originalName:
            input.originalName,
          filename: storedFilename,
          url: `/api/files/${id}/download`,
          mimetype: input.mimetype,
          size: input.size,
          path: filePath,
          associationId:
            input.associationId,
          uploadedById:
            input.uploadedById,
        },
      });
    } catch (error) {
      await unlink(filePath).catch(
        () => undefined,
      );

      throw error;
    }
  }

  /**
   * Registra un file disponibile tramite URL.
   */
  async uploadFile(dto: {
    url: string;
    name: string;
    associationId?: string | null;
    uploadedById?: string | null;
  }) {
    if (
      dto.associationId &&
      dto.uploadedById
    ) {
      await this.ensureCanManageFiles(
        dto.uploadedById,
        dto.associationId,
      );
    }

    return this.prisma.file.create({
      data: {
        url: dto.url,
        name: dto.name,
        originalName: dto.name,
        associationId:
          dto.associationId ?? null,
        uploadedById:
          dto.uploadedById ?? null,
      },
    });
  }

  /**
   * Elenco file di un'associazione.
   */
  async getFilesForAssociation(
    associationId: string,
    userId: string,
  ) {
    await this.ensureMembership(
      userId,
      associationId,
    );

    return this.prisma.file.findMany({
      where: {
        associationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * File caricati dall'utente.
   */
  async getFilesForUser(
    userId: string,
  ) {
    return this.prisma.file.findMany({
      where: {
        uploadedById: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Recupera e autorizza l'accesso
   * a un file.
   */
  async findOne(
    id: string,
    userId: string,
  ) {
    const file =
      await this.prisma.file.findUnique({
        where: {
          id,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

    if (!file) {
      throw new NotFoundException(
        "File non trovato",
      );
    }

    if (file.associationId) {
      await this.ensureMembership(
        userId,
        file.associationId,
      );
    } else if (
      file.uploadedById !== userId
    ) {
      throw new ForbiddenException(
        "Non hai accesso a questo file",
      );
    }

    return file;
  }

  /**
   * Restituisce i dati necessari
   * per il download protetto.
   */
  async getDownloadFile(
    id: string,
    userId: string,
  ) {
    const file = await this.findOne(
      id,
      userId,
    );

    if (!file.path) {
      throw new NotFoundException(
        "Il file fisico non è disponibile",
      );
    }

    try {
      await access(file.path);
    } catch {
      throw new NotFoundException(
        "Il file fisico non è stato trovato",
      );
    }

    return {
      path: file.path,
      downloadName:
        file.originalName ??
        file.name,
    };
  }

  /**
   * Elimina il record e, quando presente,
   * anche il file fisico.
   * Solo OWNER e ADMIN possono eliminare
   * file dell'associazione.
   */
  async deleteFile(
    id: string,
    userId: string,
  ) {
    const file =
      await this.prisma.file.findUnique({
        where: {
          id,
        },
      });

    if (!file) {
      throw new NotFoundException(
        "File non trovato",
      );
    }

    if (file.associationId) {
      await this.ensureCanManageFiles(
        userId,
        file.associationId,
      );
    } else if (
      file.uploadedById !== userId
    ) {
      throw new ForbiddenException(
        "Non hai i permessi per eliminare questo file",
      );
    }

    await this.prisma.file.delete({
      where: {
        id,
      },
    });

    if (file.path) {
      await unlink(file.path).catch(
        () => undefined,
      );
    }

    return {
      success: true,
      message: "File eliminato",
    };
  }
}