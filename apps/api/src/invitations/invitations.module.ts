import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { MailModule } from "../mail/mail.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { PrismaModule } from "../prisma/prisma.module";
import { UsersModule } from "../users/users.module";

import { InvitationsController } from "./invitations.controller";
import { InvitationsService } from "./invitations.service";

@Module({
  imports: [
    PrismaModule,
    MailModule,
    JwtModule.register({
      secret: "dev-secret-change",
      signOptions: {
        expiresIn: "7d",
      },
    }),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}