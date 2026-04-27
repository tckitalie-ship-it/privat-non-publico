import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class FinancesService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(currentUser: any, dto: CreateTransactionDto) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    return this.prisma.transaction.create({
      data: {
        associationId: currentUser.associationId,
        type: dto.type,
        amountCents: dto.amountCents,
        category: dto.category,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async findTransactions(currentUser: any) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    return this.prisma.transaction.findMany({
      where: {
        associationId: currentUser.associationId,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getSummary(currentUser: any) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        associationId: currentUser.associationId,
      },
    });

    const incomeCents = transactions
      .filter((transaction) => transaction.type === 'INCOME')
      .reduce((sum, transaction) => sum + transaction.amountCents, 0);

    const expenseCents = transactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .reduce((sum, transaction) => sum + transaction.amountCents, 0);

    return {
      incomeCents,
      expenseCents,
      balanceCents: incomeCents - expenseCents,
      transactionsCount: transactions.length,
    };
  }

  async exportCsv(currentUser: any) {
    if (!currentUser.associationId) {
      throw new ForbiddenException('No active association selected');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        associationId: currentUser.associationId,
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
      if (value === null || value === undefined) {
        return '';
      }

      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    };

    const rows = transactions.map((transaction) => [
      transaction.id,
      transaction.type,
      transaction.category ?? '',
      transaction.description ?? '',
      transaction.amountCents,
      (transaction.amountCents / 100).toFixed(2),
      transaction.date.toISOString(),
      transaction.createdAt.toISOString(),
    ]);

    return [
      header.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\n');
  }
}