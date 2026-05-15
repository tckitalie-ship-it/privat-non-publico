import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import { AssociationActiveGuard } from '../auth/association-active.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

import { FinancesService } from './finances.service';

@Controller('finances')
@UseGuards(
  JwtAuthGuard,
  AssociationActiveGuard,
  RolesGuard,
)
export class FinancesController {
  constructor(
    private readonly financesService: FinancesService,
  ) {}

  @Post('transactions')
  @Roles('OWNER', 'ADMIN')
  createTransaction(
    @Req() req: any,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.financesService.createTransaction(
      req.user,
      dto,
    );
  }

  @Get('transactions')
  findTransactions(@Req() req: any) {
    return this.financesService.findTransactions(
      req.user,
    );
  }

  @Get('transactions/:id')
  findOneTransaction(
    @Req() req: any,
    @Param('id') transactionId: string,
  ) {
    return this.financesService.findOneTransaction(
      req.user,
      transactionId,
    );
  }

  @Patch('transactions/:id')
  @Roles('OWNER', 'ADMIN')
  updateTransaction(
    @Req() req: any,
    @Param('id') transactionId: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.financesService.updateTransaction(
      req.user,
      transactionId,
      dto,
    );
  }

  @Delete('transactions/:id')
  @Roles('OWNER', 'ADMIN')
  deleteTransaction(
    @Req() req: any,
    @Param('id') transactionId: string,
  ) {
    return this.financesService.deleteTransaction(
      req.user,
      transactionId,
    );
  }

  @Get('summary')
  getSummary(@Req() req: any) {
    return this.financesService.getSummary(
      req.user,
    );
  }

  @Get('export.csv')
  @Roles('OWNER', 'ADMIN')
  @Header('Content-Type', 'text/csv')
  @Header(
    'Content-Disposition',
    'attachment; filename="transactions.csv"',
  )
  exportCsv(@Req() req: any) {
    return this.financesService.exportCsv(
      req.user,
    );
  }

  @Get('export.xlsx')
  @Roles('OWNER', 'ADMIN')
  async exportXlsx(
    @Req() req: any,
    @Res() res: Response,
  ) {
    const buffer =
      await this.financesService.exportXlsx(
        req.user,
      );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="transactions.xlsx"',
    );

    return res.send(buffer);
  }
}