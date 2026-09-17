import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuditLogService } from "./audit-log.service";

@Controller("audit-log")
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get("search/:associationId")
  async search(
    @Req() req: Request,
    @Param("associationId") associationId: string,
    @Query("q") q?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const userId = this.getUserId(req);

    return this.auditLogService.search(
      userId,
      associationId,
      q,
      Number(page || 1),
      Number(limit || 50),
    );
  }

  @Get("timeline/:associationId")
  async timeline(
    @Req() req: Request,
    @Param("associationId") associationId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("category") category?: string,
    @Query("action") action?: string,
  ) {
    const userId = this.getUserId(req);

    return this.auditLogService.timeline(
      userId,
      associationId,
      {
        page: Number(page || 1),
        limit: Number(limit || 100),
        search,
        category,
        action,
      },
    );
  }

  @Get("categories/:associationId")
  async categories(
    @Req() req: Request,
    @Param("associationId") associationId: string,
  ) {
    const userId = this.getUserId(req);

    return this.auditLogService.categories(
      userId,
      associationId,
    );
  }

  @Get("actions/:associationId")
  async actions(
    @Req() req: Request,
    @Param("associationId") associationId: string,
  ) {
    const userId = this.getUserId(req);

    return this.auditLogService.actions(
      userId,
      associationId,
    );
  }

  @Get("summary/:associationId")
  async summary(
    @Req() req: Request,
    @Param("associationId") associationId: string,
  ) {
    const userId = this.getUserId(req);

    return this.auditLogService.summary(
      userId,
      associationId,
    );
  }

  @Get("item/:associationId/:id")
  async findOne(
    @Req() req: Request,
    @Param("associationId") associationId: string,
    @Param("id") id: string,
  ) {
    const userId = this.getUserId(req);

    return this.auditLogService.findOne(
      userId,
      associationId,
      id,
    );
  }

  @Get(":associationId")
  async list(
    @Req() req: Request,
    @Param("associationId") associationId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("category") category?: string,
    @Query("action") action?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    const userId = this.getUserId(req);

    return this.auditLogService.findAll(
      userId,
      associationId,
      {
        page: Number(page || 1),
        limit: Number(limit || 50),
        search,
        category,
        action,
        from,
        to,
      },
    );
  }

  private getUserId(req: Request): string {
    const user = req.user as
      | {
          id?: string;
          userId?: string;
          sub?: string;
        }
      | undefined;

    const userId =
      user?.id ??
      user?.userId ??
      user?.sub;

    if (!userId) {
      throw new Error(
        "Utente autenticato non disponibile nella richiesta.",
      );
    }

    return userId;
  }
}