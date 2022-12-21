import { FinanceType } from '@prisma/client';

export class CreateFinanceDto {
  type: FinanceType;
  description: string;
  value: number;
}
