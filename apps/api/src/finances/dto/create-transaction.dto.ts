import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsIn(['INCOME', 'EXPENSE'])
  type: 'INCOME' | 'EXPENSE';

  @IsInt()
  @Min(1)
  amountCents: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  date?: string;
}