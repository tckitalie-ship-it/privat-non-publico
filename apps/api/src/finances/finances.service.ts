import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { Role } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

type TransactionType = "INCOME" | "EXPENSE";

type CreateTransactionInput = {
  associationId: string;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  amountCents: number;
  type: TransactionType;
  date: Date;
};

type UpdateTransactionInput = {
  title?: string | null;
  description?: string | null;
  category?: string | null;
  amountCents?: number;
  type?: TransactionType;
  date?: Date;
};

type FinanceFilters = {
  type?: TransactionType;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
};

@Injectable()
export class FinancesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private validateTransactionData(
    amountCents: number,
    type: string,
    date: Date,
  ) {
    if (
      !Number.isInteger(amountCents) ||
      amountCents <= 0
    ) {
      throw new BadRequestException(
        "L'importo deve essere un numero intero positivo espresso in centesimi",
      );
    }

    if (
      type !== "INCOME" &&
      type !== "EXPENSE"
    ) {
      throw new BadRequestException(
        "Tipo di transazione non valido",
      );
    }

    if (
      !(date instanceof Date) ||
      Number.isNaN(date.getTime())
    ) {
      throw new BadRequestException(
        "Data della transazione non valida",
      );
    }
  }

  private cleanOptionalText(
    value?: string | null,
  ): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const clean = value.trim();

    return clean || null;
  }

  private async ensureMembership(
    userId: string,
    associationId: string,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          associationId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Non sei membro di questa associazione",
      );
    }

    return membership;
  }

  private async ensureCanManageFinance(
    userId: string,
    associationId: string,
  ) {
    const membership =
      await this.ensureMembership(
        userId,
        associationId,
      );

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        "Non hai i permessi per gestire le finanze",
      );
    }

    return membership;
  }

  async createTransaction(
    userId: string,
    dto: CreateTransactionInput,
  ) {
    if (!dto.associationId?.trim()) {
      throw new BadRequestException(
        "Associazione non specificata",
      );
    }

    this.validateTransactionData(
      dto.amountCents,
      dto.type,
      dto.date,
    );

    await this.ensureCanManageFinance(
      userId,
      dto.associationId,
    );

    const title =
      this.cleanOptionalText(dto.title);

    const description =
      this.cleanOptionalText(dto.description);

    const category =
      this.cleanOptionalText(dto.category);

    return this.prisma.transaction.create({
      data: {
        associationId: dto.associationId,
        title,
        description,
        category,
        amountCents: dto.amountCents,
        type: dto.type,
        date: dto.date,
      },
    });
  }

  async findAll(
    associationId: string,
    userId: string,
  ) {
    await this.ensureMembership(
      userId,
      associationId,
    );

    return this.prisma.transaction.findMany({
      where: {
        associationId,
      },
      orderBy: [
        {
          date: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
  }

  async findOne(
    id: string,
    userId: string,
  ) {
    const transaction =
      await this.prisma.transaction.findUnique({
        where: {
          id,
        },
      });

    if (!transaction) {
      throw new NotFoundException(
        "Transazione non trovata",
      );
    }

    await this.ensureMembership(
      userId,
      transaction.associationId,
    );

    return transaction;
  }

  async updateTransaction(
    id: string,
    userId: string,
    dto: UpdateTransactionInput,
  ) {
    const transaction =
      await this.prisma.transaction.findUnique({
        where: {
          id,
        },
      });

    if (!transaction) {
      throw new NotFoundException(
        "Transazione non trovata",
      );
    }

    await this.ensureCanManageFinance(
      userId,
      transaction.associationId,
    );

    const nextAmount =
      dto.amountCents ??
      transaction.amountCents;

    const nextType =
      dto.type ??
      transaction.type;

    const nextDate =
      dto.date ??
      transaction.date;

    this.validateTransactionData(
      nextAmount,
      nextType,
      nextDate,
    );

    const data: {
      title?: string | null;
      description?: string | null;
      category?: string | null;
      amountCents?: number;
      type?: TransactionType;
      date?: Date;
    } = {};

    if (
      dto.title !== undefined
    ) {
      data.title =
        this.cleanOptionalText(
          dto.title,
        );
    }

    if (
      dto.description !== undefined
    ) {
      data.description =
        this.cleanOptionalText(
          dto.description,
        );
    }

    if (
      dto.category !== undefined
    ) {
      data.category =
        this.cleanOptionalText(
          dto.category,
        );
    }

    if (
      dto.amountCents !== undefined
    ) {
      data.amountCents =
        dto.amountCents;
    }

    if (
      dto.type !== undefined
    ) {
      data.type = dto.type;
    }

    if (
      dto.date !== undefined
    ) {
      data.date = dto.date;
    }

    if (
      Object.keys(data).length === 0
    ) {
      throw new BadRequestException(
        "Nessuna modifica specificata",
      );
    }

    return this.prisma.transaction.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteTransaction(
    id: string,
    userId: string,
  ) {
    const transaction =
      await this.prisma.transaction.findUnique({
        where: {
          id,
        },
      });

    if (!transaction) {
      throw new NotFoundException(
        "Transazione non trovata",
      );
    }

    await this.ensureCanManageFinance(
      userId,
      transaction.associationId,
    );

    await this.prisma.transaction.delete({
      where: {
        id,
      },
    });

    return {
      message: "Transazione eliminata",
    };
  }

  async getSummary(
    associationId: string,
    userId: string,
  ) {
    await this.ensureMembership(
      userId,
      associationId,
    );

    const result =
      await this.prisma.transaction.groupBy({
        by: ["type"],
        where: {
          associationId,
        },
        _sum: {
          amountCents: true,
        },
      });

    let totalIncome = 0;
    let totalExpense = 0;

    for (const row of result) {
      const amount =
        row._sum.amountCents ?? 0;

      if (row.type === "INCOME") {
        totalIncome += amount;
      }

      if (row.type === "EXPENSE") {
        totalExpense += amount;
      }
    }

    return {
      totalIncome,
      totalExpense,
      balance:
        totalIncome - totalExpense,
    };
  }

  async filter(
    associationId: string,
    userId: string,
    filters: FinanceFilters,
  ) {
    await this.ensureMembership(
      userId,
      associationId,
    );

    if (
      filters.type !== undefined &&
      filters.type !== "INCOME" &&
      filters.type !== "EXPENSE"
    ) {
      throw new BadRequestException(
        "Tipo di transazione non valido",
      );
    }

    if (
      filters.dateFrom &&
      Number.isNaN(
        filters.dateFrom.getTime(),
      )
    ) {
      throw new BadRequestException(
        "Data iniziale non valida",
      );
    }

    if (
      filters.dateTo &&
      Number.isNaN(
        filters.dateTo.getTime(),
      )
    ) {
      throw new BadRequestException(
        "Data finale non valida",
      );
    }

    if (
      filters.dateFrom &&
      filters.dateTo &&
      filters.dateFrom > filters.dateTo
    ) {
      throw new BadRequestException(
        "L'intervallo di date non è valido",
      );
    }

    if (
      filters.minAmount !== undefined &&
      (
        !Number.isInteger(
          filters.minAmount,
        ) ||
        filters.minAmount < 0
      )
    ) {
      throw new BadRequestException(
        "Importo minimo non valido",
      );
    }

    if (
      filters.maxAmount !== undefined &&
      (
        !Number.isInteger(
          filters.maxAmount,
        ) ||
        filters.maxAmount < 0
      )
    ) {
      throw new BadRequestException(
        "Importo massimo non valido",
      );
    }

    if (
      filters.minAmount !== undefined &&
      filters.maxAmount !== undefined &&
      filters.minAmount >
        filters.maxAmount
    ) {
      throw new BadRequestException(
        "L'intervallo degli importi non è valido",
      );
    }

    const category =
      filters.category?.trim();

    return this.prisma.transaction.findMany({
      where: {
        associationId,

        type: filters.type,

        category: category
          ? {
              contains: category,
              mode: "insensitive",
            }
          : undefined,

        date: {
          gte: filters.dateFrom,
          lte: filters.dateTo,
        },

        amountCents: {
          gte: filters.minAmount,
          lte: filters.maxAmount,
        },
      },

      orderBy: [
        {
          date: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
  }
}