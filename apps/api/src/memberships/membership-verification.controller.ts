import {
  Controller,
  Get,
  NotFoundException,
  Param,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("memberships/verify")
export class MembershipVerificationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(":id")
  async verify(@Param("id") id: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { id },
      select: {
        id: true,
        memberNumber: true,
        firstName: true,
        lastName: true,
        role: true,
        association: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException("Tessera non trovata");
    }

    return {
      valid: true,
      membershipId: membership.id,
      memberNumber: membership.memberNumber,
      firstName: membership.firstName,
      lastName: membership.lastName,
      role: membership.role,
      associationName: membership.association?.name ?? "Associazione",
    };
  }
}