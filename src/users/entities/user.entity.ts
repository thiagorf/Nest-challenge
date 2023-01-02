import { ApiProperty } from '@nestjs/swagger';
import { Finance } from 'src/finances/entities/finance.entity';

export class User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}
