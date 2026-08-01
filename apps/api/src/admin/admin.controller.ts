import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { Role } from "@prisma/client";
@Controller("admin")
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifica che l’utente sia super-admin
   */
  private ensureSuperAdmin(user: any) {
    if (user.role !== "ADMIN") {
      throw new ForbiddenException("Permessi insufficienti");
    }
  }

  /**
   * Panoramica globale del sistema
   */
  @UseGuards(JwtAuthGuard)
  @Get("overview")
  async overview(@CurrentUser() user: any) {
    this.ensureSuperAdmin(user);

    const [users, associations, events, finances] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.association.count(),
      this.prisma.event.count(),
      this.prisma.transaction.count(), // ✅ CORRETTO
    ]);

    return {
      users,
      associations,
      events,
      finances,
    };
  }

  /**
   * Lista utenti
   */
  @UseGuards(JwtAuthGuard)
  @Get("users")
  async listUsers(@CurrentUser() user: any) {
    this.ensureSuperAdmin(user);

    return this.prisma.user.findMany({
      include: {
        memberships: {
          include: { association: true },
        },
      },
    });
  }

  /**
   * Aggiorna email utente
   */
  @UseGuards(JwtAuthGuard)
  @Patch("users/:id")
  async updateUser(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: { email?: string }
  ) {
    this.ensureSuperAdmin(user);

    return this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
      },
    });
  }

  /**
   * Elimina utente
   */
  @UseGuards(JwtAuthGuard)
  @Delete("users/:id")
  async deleteUser(@CurrentUser() user: any, @Param("id") id: string) {
    this.ensureSuperAdmin(user);

    await this.prisma.membership.deleteMany({ where: { userId: id } });
    await this.prisma.invitation.deleteMany({ where: { invitedById: id } });

    await this.prisma.user.delete({ where: { id } });

    return { message: "Utente eliminato" };
  }

  /**
   * Lista associazioni
   */
  @UseGuards(JwtAuthGuard)
  @Get("associations")
  async listAssociations(@CurrentUser() user: any) {
    this.ensureSuperAdmin(user);

    return this.prisma.association.findMany({
      include: {
        memberships: true,
      },
    });
  }

  /**
   * Aggiorna stato associazione
   */
  @UseGuards(JwtAuthGuard)
  @Patch("associations/:id")
  async updateAssociation(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: { name?: string; isActive?: boolean }
  ) {
    this.ensureSuperAdmin(user);

    return this.prisma.association.update({
      where: { id },
      data: {
        name: dto.name,
        isActive: dto.isActive,
      },
    });
  }

  /**
   * Elimina associazione
   */
  @UseGuards(JwtAuthGuard)
  @Delete("associations/:id")
  async deleteAssociation(@CurrentUser() user: any, @Param("id") id: string) {
    this.ensureSuperAdmin(user);

    await this.prisma.membership.deleteMany({ where: { associationId: id } });
    await this.prisma.event.deleteMany({ where: { associationId: id } });
    await this.prisma.transaction.deleteMany({ where: { associationId: id } }); // ✅ CORRETTO
    await this.prisma.file.deleteMany({ where: { associationId: id } });

    await this.prisma.association.delete({ where: { id } });

    return { message: "Associazione eliminata" };
  }

  /**
   * Aggiorna ruolo utente in un’associazione
   */
  @UseGuards(JwtAuthGuard)
  @Patch("role/:membershipId")
  async updateRole(
    @CurrentUser() user: any,
    @Param("membershipId") membershipId: string,
    @Body() dto: { role: Role }
  ) {
    this.ensureSuperAdmin(user);

    return this.prisma.membership.update({
      where: { id: membershipId },
      data: { role: dto.role },
    });
  }
}
