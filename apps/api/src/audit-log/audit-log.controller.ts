import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from "@nestjs/common";
import { AuditLogService } from "./audit-log.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@Controller("api/audit-log")
export class AuditLogController {
  constructor(private readonly audit: AuditLogService) {}

  /**
   * Log dell’associazione
   */
  @UseGuards(JwtAuthGuard)
  @Get("association/:associationId")
  async getAssociationLogs(
    @CurrentUser() user: any,
    @Param("associationId") associationId: string,
    @Query("category") category?: string,
    @Query("actorId") targetActorId?: string
  ) {
    return this.audit.search({
      associationId,
      category,
      actorId: targetActorId,
    });
  }

  /**
   * Log dell’utente loggato
   */
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getMyLogs(@CurrentUser() user: any) {
    return this.audit.findAllForUser(user.sub);
  }

  /**
   * Ricerca nei log dell’associazione
   */
  @UseGuards(JwtAuthGuard)
  @Get("search/:associationId")
  async search(
    @CurrentUser() user: any,
    @Param("associationId") associationId: string,
    @Query("q") q: string
  ) {
    return this.audit.search({
      associationId,
      action: q,
    });
  }
}
