import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export class UserFinance extends User {
  @ApiProperty()
  finances: number;
}
