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
   * Profilo dell'utente autenticato.
   */
  @Get("me")
  async me(
    @CurrentUser() user: any,
  ) {
    console.log("[USERS/ME] AUTH USER:", {
      id: user?.id,
      sub: user?.sub,
      email: user?.email,
      role: user?.role,
    });

    const profile = await this.prisma.user.findUnique({
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

    console.log(
      "[USERS/ME] PROFILE FOUND:",
      !!profile,
    );

    if (profile) {
      console.log(
        "[USERS/ME] PROFILE ID:",
        profile.id,
      );
      console.log(
        "[USERS/ME] PROFILE EMAIL:",
        profile.email,
      );
    }

    if (!profile) {
      throw new BadRequestException(
        "Profilo utente non trovato",
      );
    }

    return profile;
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
   * Profilo di un utente appartenente ad almeno una
   * associazione condivisa con l'utente autenticato.
   */
  @Get(":id")
  async findOne(
    @CurrentUser() user: any,
    @Param("id") id: string,
  ) {
    const requesterMemberships =
      await this.prisma.membership.findMany({
        where: {
          userId: user.sub,
        },
        select: {
          associationId: true,
        },
      });

    const associationIds =
      requesterMemberships.map(
        (membership) => membership.associationId,
      );

    if (associationIds.length === 0) {
      throw new BadRequestException(
        "Nessuna associazione collegata all'utente autenticato",
      );
    }

    const profile =
      await this.prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          memberships: {
            where: {
              associationId: {
                in: associationIds,
              },
            },
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

    if (!profile || profile.memberships.length === 0) {
      throw new BadRequestException(
        "Utente non appartenente a un'associazione accessibile",
      );
    }

    return profile;
  }

  /**
   * File caricati da un utente appartenente ad almeno una
   * associazione condivisa con l'utente autenticato.
   */
  @Get(":id/uploaded-files")
  async getUploadedFiles(
    @CurrentUser() user: any,
    @Param("id") id: string,
  ) {
    const requesterMemberships =
      await this.prisma.membership.findMany({
        where: {
          userId: user.sub,
        },
        select: {
          associationId: true,
        },
      });

    const associationIds =
      requesterMemberships.map(
        (membership) => membership.associationId,
      );

    if (associationIds.length === 0) {
      throw new BadRequestException(
        "Nessuna associazione collegata all'utente autenticato",
      );
    }

    const targetMemberships =
      await this.prisma.membership.findMany({
        where: {
          userId: id,
          associationId: {
            in: associationIds,
          },
        },
        select: {
          associationId: true,
        },
      });

    const sharedAssociationIds =
      targetMemberships.map(
        (membership) => membership.associationId,
      );

    if (sharedAssociationIds.length === 0) {
      throw new BadRequestException(
        "Utente non appartenente a un'associazione accessibile",
      );
    }

    return this.prisma.file.findMany({
      where: {
        uploadedById: id,
        associationId: {
          in: sharedAssociationIds,
        },
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
   * Modifica il profilo dell'utente autenticato.
   */
  @Patch("me")
  async updateMe(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    const email = dto.email?.trim().toLowerCase();

    if (!email) {
      throw new BadRequestException(
        "L'email Ã¨ obbligatoria",
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
        "Questa email Ã¨ giÃ  utilizzata da un altro account",
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
