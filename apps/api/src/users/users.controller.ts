import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { PrismaService } from "../prisma/prisma.service";

type UpdateProfileDto = {
  email?: string;
};

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Profilo di un utente.
   *
   * L'utente autenticato può consultare
   * i dati necessari alla gestione dell'app.
   */
  @Get(":id")
  async findOne(
    @Param("id") id: string,
  ) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        memberships: {
          select: {
            associationId: true,
            role: true,
            association: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * File caricati da un utente.
   */
  @Get(":id/uploaded-files")
  async getUploadedFiles(
    @Param("id") id: string,
  ) {
    return this.prisma.file.findMany({
      where: {
        uploadedById: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        url: true,
        mimetype: true,
        size: true,
        createdAt: true,
      },
    });
  }

  /**
   * Associazioni dell'utente autenticato.
   */
  @Get("me/associations")
  async myAssociations(
    @CurrentUser() user: any,
  ) {
    return this.prisma.membership.findMany({
      where: {
        userId: user.sub,
      },
      include: {
        association: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * Profilo dell'utente autenticato.
   */
  @Get("me")
  async me(
    @CurrentUser() user: any,
  ) {
    return this.prisma.user.findUnique({
      where: {
        id: user.sub,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        memberships: {
          select: {
            id: true,
            associationId: true,
            role: true,
            association: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Modifica il profilo dell'utente autenticato.
   *
   * Per ora permettiamo solamente la modifica
   * dell'email, perché è l'unico dato modificabile
   * realmente presente nel modello User attuale.
   */
  @Patch("me")
  async updateMe(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    const email = dto.email?.trim().toLowerCase();

    if (!email) {
      throw new BadRequestException(
        "L'email è obbligatoria",
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      throw new BadRequestException(
        "Inserisci un indirizzo email valido",
      );
    }

    const existing =
      await this.prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: user.sub,
          },
        },
        select: {
          id: true,
        },
      });

    if (existing) {
      throw new BadRequestException(
        "Questa email è già utilizzata da un altro account",
      );
    }

    return this.prisma.user.update({
      where: {
        id: user.sub,
      },
      data: {
        email,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        memberships: {
          select: {
            id: true,
            associationId: true,
            role: true,
            association: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }
}