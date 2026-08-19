import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { Role } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

type TransactionType = "INCOME" | "EXPENSE";

@Injectable()
export class FinancesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

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
    dto: {
      associationId: string;
      title?: string | null;
      description?: string | null;
      category?: string | null;
      amountCents: number;
      type: TransactionType;
      date: Date;
    },
  ) {
    await this.ensureCanManageFinance(
      userId,
      dto.associationId,
    );

    return this.prisma.transaction.create({
      data: {
        associationId: dto.associationId,
        title: dto.title ?? null,
        description: dto.description ?? null,
        category: dto.category ?? null,
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
      orderBy: {
        date: "desc",
      },
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
    dto: {
      title?: string | null;
      description?: string | null;
      category?: string | null;
      amountCents?: number;
      type?: TransactionType;
      date?: Date;
    },
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

    return this.prisma.transaction.update({
      where: {
        id,
      },
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        amountCents: dto.amountCents,
        type: dto.type,
        date: dto.date,
      },
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

    const income =
      await this.prisma.transaction.aggregate({
        where: {
          associationId,
          type: "INCOME",
        },
        _sum: {
          amountCents: true,
        },
      });

    const expense =
      await this.prisma.transaction.aggregate({
        where: {
          associationId,
          type: "EXPENSE",
        },
        _sum: {
          amountCents: true,
        },
      });

    const totalIncome =
      income._sum.amountCents ?? 0;

    const totalExpense =
      expense._sum.amountCents ?? 0;

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
    filters: {
      type?: TransactionType;
      category?: string;
      dateFrom?: Date;
      dateTo?: Date;
      minAmount?: number;
      maxAmount?: number;
    },
  ) {
    await this.ensureMembership(
      userId,
      associationId,
    );

    return this.prisma.transaction.findMany({
      where: {
        associationId,
        type: filters.type,
        category: filters.category
          ? {
              contains:
                filters.category,
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
      orderBy: {
        date: "desc",
      },
    });
  }
  }