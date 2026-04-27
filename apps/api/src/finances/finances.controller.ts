import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FinancesService } from './finances.service';

@Controller('finances')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinancesController {
  constructor(
    private readonly financesService: FinancesService,
  ) {}

  @Post('transactions')
  @Roles('OWNER','ADMIN')
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

  @Get('summary')
  getSummary(@Req() req: any) {
    return this.financesService.getSummary(
      req.user,
    );
  }
}