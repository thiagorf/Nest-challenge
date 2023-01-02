import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export class Userbalance extends User {
  @ApiProperty()
  total_balance: number;
}
