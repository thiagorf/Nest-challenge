import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Session as GetSession,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FinancesService } from './finances.service';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { Session } from 'express-session';
import { FilterQuery } from './finances.query';
import { ApiCookieAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Finance } from './entities/finance.entity';
import { PaginatedFinances } from './entities/paginated-finance.entity';

@ApiTags('finances')
@ApiCookieAuth()
@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Finance has been successfully created.',
    type: Finance,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient funds.',
  })
  async create(
    @Body() createFinanceDto: CreateFinanceDto,
    @GetSession() session: Session,
  ) {
    return await this.financesService.create(
      createFinanceDto,
      session.user.email,
    );
  }

  @Get()
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'page_number',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'start_at',
    required: false,
    type: Date,
  })
  @ApiQuery({
    name: 'ends_at',
    required: false,
    type: Date,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated finances',
    type: PaginatedFinances,
  })
  async findAll(@Query() query: FilterQuery, @GetSession() session: Session) {
    return await this.financesService.findAll(query, session.user.email);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    type: Finance,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or inexisting finance',
  })
  async findOne(@Param('id') id: string, @GetSession() session: Session) {
    return await this.financesService.findOne(+id, session.user.email);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    type: Finance,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or inexisting finance',
  })
  async update(
    @Param('id') id: string,
    @Body() updateFinanceDto: UpdateFinanceDto,
    @GetSession() session: Session,
  ) {
    // check balance logic
    return await this.financesService.update(
      +id,
      updateFinanceDto,
      session.user.email,
    );
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Finance has been deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or inexisting finance',
  })
  async remove(@Param('id') id: string, @GetSession() session: Session) {
    await this.financesService.remove(+id, session.user.email);

    return {
      msg: 'Finance has been deleted',
    };
  }
}
