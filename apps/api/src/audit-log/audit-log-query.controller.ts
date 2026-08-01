import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { AuditLogQueryService } from "./audit-log-query.service";

@Controller("api/audit-log/query")
export class AuditLogQueryController {
  constructor(private readonly queryService: AuditLogQueryService) {}

  /**
   * Ricerca avanzata con filtri combinati
   */
  @UseGuards(JwtAuthGuard)
  @Get("")
  async query(
    @CurrentUser() user: any,
    @Query("associationId") associationId?: string,
    @Query("userId") userId?: string,
    @Query("category") category?: string,
    @Query("keyword") keyword?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("order") order?: "asc" | "desc"
  ) {
    return this.queryService.query({
      associationId,
      userId,
      category,
      keyword,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 30,
      order: order ?? "desc",
    });
  }

  /**
   * Timeline filtrata (raggruppata per giorno)
   */
  @UseGuards(JwtAuthGuard)
  @Get("timeline")
  async timeline(
    @CurrentUser() user: any,
    @Query("associationId") associationId?: string,
    @Query("userId") userId?: string,
    @Query("category") category?: string,
    @Query("keyword") keyword?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("order") order?: "asc" | "desc"
  ) {
    return this.queryService.timeline({
      associationId,
      userId,
      category,
      keyword,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 30,
      order: order ?? "desc",
    });
  }

  /**
   * Ricerca full‑text
   */
  @UseGuards(JwtAuthGuard)
  @Get("search/:associationId")
  async search(
    @CurrentUser() user: any,
    @Param("associationId") associationId: string,
    @Query("q") q: string
  ) {
    return this.queryService.search(associationId, q);
  }

  /**
   * Ricerca per intervallo temporale
   */
  @UseGuards(JwtAuthGuard)
  @Get("range/:associationId")
  async range(
    @CurrentUser() user: any,
    @Param("associationId") associationId: string,
    @Query("from") from: string,
    @Query("to") to: string
  ) {
    return this.queryService.range(
      associationId,
      new Date(from),
      new Date(to)
    );
  }
}
