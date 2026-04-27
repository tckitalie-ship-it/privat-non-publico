import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AssociationActiveGuard } from '../auth/association-active.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FinancesService } from './finances.service';

@Controller('finances')
@UseGuards(JwtAuthGuard, AssociationActiveGuard, RolesGuard)
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Post('transactions')
  @Roles('OWNER', 'ADMIN')
  createTransaction(@Req() req: any, @Body() dto: CreateTransactionDto) {
    return this.financesService.createTransaction(req.user, dto);
  }

  @Get('transactions')
  findTransactions(@Req() req: any) {
    return this.financesService.findTransactions(req.user);
  }

  @Get('summary')
  getSummary(@Req() req: any) {
    return this.financesService.getSummary(req.user);
  }

  @Get('export.csv')
  @Roles('OWNER', 'ADMIN')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="transactions.csv"')
  exportCsv(@Req() req: any) {
    return this.financesService.exportCsv(req.user);
  }

  @Get('export.xlsx')
  @Roles('OWNER', 'ADMIN')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="transactions.xlsx"')
  exportXlsx(@Req() req: any) {
    return this.financesService.exportXlsx(req.user);
  }
}