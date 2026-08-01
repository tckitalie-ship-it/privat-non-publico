import {
  Controller,
  Get,
  Param,
  UseGuards,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Profilo utente (pubblico)
   */
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.prisma.user.findUnique({
      where: { id },
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
   * File caricati da un utente
   */
  @UseGuards(JwtAuthGuard)
  @Get(":id/uploaded-files")
  async getUploadedFiles(@Param("id") id: string) {
    return this.prisma.file.findMany({
      where: { uploadedById: id },
      orderBy: { createdAt: "desc" },
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
   * Le associazioni dell’utente loggato
   */
  @UseGuards(JwtAuthGuard)
  @Get("me/associations")
  async myAssociations(@CurrentUser() user: any) {
    return this.prisma.membership.findMany({
      where: { userId: user.sub },
      include: {
        association: true,
      },
    });
  }

  /**
   * Dettaglio utente loggato
   */
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: any) {
    return this.prisma.user.findUnique({
      where: { id: user.sub },
      include: {
        memberships: {
          include: {
            association: true,
          },
        },
      },
    });
  }
}
