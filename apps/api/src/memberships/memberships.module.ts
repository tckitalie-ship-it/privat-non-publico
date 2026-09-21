import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { MembershipsController } from "./memberships.controller";
import { PublicMembershipVerificationController } from "./public-membership-verification.controller";
import { MembershipsService } from "./memberships.service";

@Module({
  imports: [PrismaModule],
  controllers: [
    PublicMembershipVerificationController,
    MembershipsController,
  ],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
