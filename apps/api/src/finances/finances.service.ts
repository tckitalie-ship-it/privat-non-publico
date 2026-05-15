import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as ExcelJS from 'exceljs';

import { PrismaService } from '../prisma/prisma.service';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class FinancesService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(
    currentUser: any,
    dto: CreateTransactionDto,
  ) {
    if (!currentUser.associationId) {
      throw new ForbiddenException(
        'No active association selected',
      );
    }

    return this.prisma.transaction.create({
      data: {
        associationId:
          currentUser.associationId,
        type: dto.type,
        amountCents: dto.amountCents,
        category: dto.category,
        description: dto.description,
        date: dto.date
          ? new Date(dto.date)
          : new Date(),
      },
    });
  }

  async findTransactions(currentUser: any) {
    if (!currentUser.associationId) {
      throw new ForbiddenException(
        'No active association selected',
      );
    }

    return this.prisma.transaction.findMany({
      where: {
        associationId:
          currentUser.associationId,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOneTransaction(
    currentUser: any,
    transactionId: string,
  ) {
    if (!currentUser.associationId) {
      throw new ForbiddenException(
        'No active association selected',
      );
    }

    const transaction =
      await this.prisma.transaction.findUnique({
        where: {
          id: transactionId,
        },
      });

    if (!transaction) {
      throw new NotFoundException(
        'Transaction not found',
      );
    }

    if (
      transaction.associationId !==
      currentUser.associationId
    ) {
      throw new ForbiddenException(
        'Wrong association',
      );
    }

    return transaction;
  }

  async updateTransaction(
    currentUser: any,
    transactionId: string,
    dto: UpdateTransactionDto,
  ) {
    await this.findOneTransaction(
      currentUser,
      transactionId,
    );

    return this.prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        type: dto.type,
        amountCents: dto.amountCents,
        category: dto.category,
        description: dto.description,
        date: dto.date
          ? new Date(dto.date)
          : undefined,
      },
    });
  }

  async deleteTransaction(
    currentUser: any,
    transactionId: string,
  ) {
    await this.findOneTransaction(
      currentUser,
      transactionId,
    );

    await this.prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });

    return {
      success: true,
    };
  }

  async getSummary(currentUser: any) {
    if (!currentUser.associationId) {
      throw new ForbiddenException(
        'No active association selected',
      );
    }

    const transactions =
      await this.prisma.transaction.findMany({
        where: {
          associationId:
            currentUser.associationId,
        },
      });

    const incomeCents = transactions
      .filter(
        (transaction) =>
          transaction.type === 'INCOME',
      )
      .reduce(
        (sum, transaction) =>
          sum + transaction.amountCents,
        0,
      );

    const expenseCents = transactions
      .filter(
        (transaction) =>
          transaction.type === 'EXPENSE',
      )
      .reduce(
        (sum, transaction) =>
          sum + transaction.amountCents,
        0,
      );

    return {
      incomeCents,
      expenseCents,
      balanceCents:
        incomeCents - expenseCents,
      transactionsCount:
        transactions.length,
    };
  }

  async exportCsv(currentUser: any) {
    if (!currentUser.associationId) {
      throw new ForbiddenException(
        'No active association selected',
      );
    }

    const transactions =
      await this.prisma.transaction.findMany({
        where: {
          associationId:
            currentUser.associationId,
        },
        orderBy: {
          date: 'desc',
        },
      });

    const header = [
      'id',
      'type',
      'category',
      'description',
      'amountCents',
      'amount',
      'date',
      'createdAt',
    ];

    const escapeCsv = (value: unknown) => {
      if (
        value === null ||
        value === undefined
      ) {
        return '';
      }

      const stringValue = String(
        value,
      ).replace(/"/g, '""');

      return `"${stringValue}"`;
    };

    const rows = transactions.map(
      (transaction) => [
        transaction.id,
        transaction.type,
        transaction.category ?? '',
        transaction.description ?? '',
        transaction.amountCents,
        (
          transaction.amountCents / 100
        ).toFixed(2),
        transaction.date.toISOString(),
        transaction.createdAt.toISOString(),
      ],
    );

    return [
      header.map(escapeCsv).join(','),
      ...rows.map((row) =>
        row.map(escapeCsv).join(','),
      ),
    ].join('\n');
  }

  async exportXlsx(currentUser: any) {
    if (!currentUser.associationId) {
      throw new ForbiddenException(
        'No active association selected',
      );
    }

    const transactions =
      await this.prisma.transaction.findMany({
        where: {
          associationId:
            currentUser.associationId,
        },
        orderBy: {
          date: 'desc',
        },
      });

    const workbook =
      new ExcelJS.Workbook();

    const sheet =
      workbook.addWorksheet(
        'Transactions',
      );

    sheet.columns = [
      {
        header: 'Type',
        key: 'type',
        width: 15,
      },
      {
        header: 'Category',
        key: 'category',
        width: 25,
      },
      {
        header: 'Description',
        key: 'description',
        width: 30,
      },
      {
        header: 'Amount',
        key: 'amount',
        width: 15,
      },
      {
        header: 'Date',
        key: 'date',
        width: 25,
      },
    ];

    transactions.forEach(
      (transaction) => {
        sheet.addRow({
          type: transaction.type,
          category:
            transaction.category ?? '',
          description:
            transaction.description ??
            '',
          amount:
            transaction.amountCents /
            100,
          date:
            transaction.date.toISOString(),
        });
      },
    );

    const buffer =
      await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer);
  }
}