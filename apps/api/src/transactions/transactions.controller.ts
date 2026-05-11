import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(
    @Req() req: any,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(req.user, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.transactionsService.findAll(req.user);
  }
}