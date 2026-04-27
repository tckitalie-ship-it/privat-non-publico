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
}