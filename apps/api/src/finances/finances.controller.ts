import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { JwtUser } from "../auth/jwt-user.interface";

import { FinancesService } from "./finances.service";

@Controller("finances")
@UseGuards(JwtAuthGuard)
export class FinancesController {
  constructor(
    private readonly finances: FinancesService,
  ) {}

  /**
   * Crea una transazione
   */
  @Post()
  async create(
    @CurrentUser() user: JwtUser,
    @Body()
    dto: {
      associationId: string;
      title?: string | null;
      description?: string | null;
      category?: string | null;
      amountCents: number;
      type: "INCOME" | "EXPENSE";
      date: string;
    },
  ) {
    return this.finances.createTransaction(user.id, {
      ...dto,
      date: new Date(dto.date),
    });
  }

  /**
   * Tutte le transazioni dell'associazione
   */
  @Get("association/:associationId")
  async findAll(
    @CurrentUser() user: JwtUser,
    @Param("associationId") associationId: string,
  ) {
    return this.finances.findAll(
      associationId,
      user.id,
    );
  }

  /**
   * Riepilogo finanziario
   */
  @Get("summary/:associationId")
  async summary(
    @CurrentUser() user: JwtUser,
    @Param("associationId") associationId: string,
  ) {
    return this.finances.getSummary(
      associationId,
      user.id,
    );
  }

  /**
   * Filtri avanzati
   */
  @Post("filter/:associationId")
  async filter(
    @CurrentUser() user: JwtUser,
    @Param("associationId") associationId: string,
    @Body()
    
    filters: {
  type?: "INCOME" | "EXPENSE";
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
},
  ) {
    return this.finances.filter(
      associationId,
      user.id,
      {
        ...filters,
        dateFrom: filters.dateFrom
          ? new Date(filters.dateFrom)
          : undefined,
        dateTo: filters.dateTo
          ? new Date(filters.dateTo)
          : undefined,
      },
    );
  }

  /**
   * Dettaglio transazione
   */
  @Get(":id")
  async findOne(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
  ) {
    return this.finances.findOne(id, user.id);
  }

  /**
   * Aggiorna transazione
   */
  @Patch(":id")
  async update(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Body()
    dto: {
      title?: string | null;
      description?: string | null;
      category?: string | null;
      amountCents?: number;
      type?: "INCOME" | "EXPENSE";
      date?: string;
    },
  ) {
    return this.finances.updateTransaction(
      id,
      user.id,
      {
        ...dto,
        date: dto.date
          ? new Date(dto.date)
          : undefined,
      },
    );
  }

  /**
   * Elimina transazione
   */
  @Delete(":id")
  async delete(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
  ) {
    return this.finances.deleteTransaction(
      id,
      user.id,
    );
  }
}