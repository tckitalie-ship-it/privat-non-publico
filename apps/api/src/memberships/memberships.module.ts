import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";
import { MembershipsController } from "./memberships.controller";
import { MembershipVerificationController } from "./membership-verification.controller";
import { MembershipsService } from "./memberships.service";

@Module({
  imports: [PrismaModule],
  controllers: [
    MembershipsController,
    MembershipVerificationController,
  ],
  providers: [MembershipsService],
})
export class MembershipsModule {}