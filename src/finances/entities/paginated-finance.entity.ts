import { ApiProperty } from '@nestjs/swagger';
import { Finance } from './finance.entity';

class Pagination {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalFinances: number;
  @ApiProperty()
  totalPages: number;
}

export class PaginatedFinances {
  @ApiProperty({
    isArray: true,
    type: Finance,
  })
  finances: Finance[];

  @ApiProperty()
  pagination: Pagination;
}
