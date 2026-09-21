import {
  Controller,
  Get,
  NotFoundException,
  Param,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("public/membership-verification")
export class PublicMembershipVerificationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(":id")
  async verify(@Param("id") id: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { id },
      select: {
        id: true,
        association: {
          select: {
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!membership || !membership.association.isActive) {
      throw new NotFoundException("Tessera non valida");
    }

    return {
      valid: true,
      associationName: membership.association.name,
    };
  }
}
