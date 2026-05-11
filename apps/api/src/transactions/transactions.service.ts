import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUser: any, dto: CreateTransactionDto) {
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
      },
    });
  }

  async findAll(currentUser: any) {
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
}