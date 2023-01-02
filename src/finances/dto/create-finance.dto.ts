import { ApiProperty } from '@nestjs/swagger';
import { FinanceType } from '@prisma/client';

export class CreateFinanceDto {
  @ApiProperty({
    enum: FinanceType,
    description: 'choose between income or expense',
  })
  type: FinanceType;

  @ApiProperty()
  description: string;

  @ApiProperty()
  value: number;
}
