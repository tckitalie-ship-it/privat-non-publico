import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";
import { MembershipsController } from "./memberships.controller";
import { MembershipsService } from "./memberships.service";

@Module({
  imports: [PrismaModule],
  controllers: [MembershipsController],
  providers: [MembershipsService],
})
export class MembershipsModule {}
