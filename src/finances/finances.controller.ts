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
} from '@nestjs/common';
import { FinancesService } from './finances.service';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { Session } from 'express-session';
import { FilterQuery } from './finances.query';

@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Post()
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
  async findAll(@Query() query: FilterQuery, @GetSession() session: Session) {
    return await this.financesService.findAll(query, session.user.email);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetSession() session: Session) {
    return await this.financesService.findOne(+id, session.user.email);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFinanceDto: UpdateFinanceDto,
    @GetSession() session: Session,
  ) {
    return await this.financesService.update(
      +id,
      updateFinanceDto,
      session.user.email,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetSession() session: Session) {
    await this.financesService.remove(+id, session.user.email);

    return {
      msg: 'Finance has been deleted',
    };
  }
}
