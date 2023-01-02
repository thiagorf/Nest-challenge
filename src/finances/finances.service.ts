import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/provider/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { FilterQuery } from './finances.query';

@Injectable()
export class FinancesService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  async create(createFinanceDto: CreateFinanceDto, sessionEmail: string) {
    //this method already check if user exists
    // const user = await this.authService.whoIAm(sessionEmail);

    const user = await this.userService.getBalance(sessionEmail);

    if (
      createFinanceDto.type === 'expense' &&
      user.total_balance - createFinanceDto.value < 0
    ) {
      throw new HttpException('Insufficient funds', HttpStatus.BAD_REQUEST);
    }
    const finance = await this.prisma.finance.create({
      data: {
        ...createFinanceDto,
        user_id: user.id,
      },
    });

    return finance;
  }

  async findAll(
    { limit = 10, page_number = 1, start_at, ends_at }: FilterQuery,
    email: string,
  ) {
    const user = await this.authService.whoIAm(email);

    const where = {
      user_id: user.id,
      ...(start_at &&
        ends_at && {
          created_at: {
            lte: ends_at,
            gte: start_at,
          },
        }),
    };

    const [finances, totalFinances] = await this.prisma.$transaction([
      this.prisma.finance.findMany({
        skip: (+page_number - 1) * +limit,
        take: +limit,
        where,
      }),
      // add date filter
      this.prisma.finance.count({ where }),
    ]);

    return {
      finances,
      pagination: {
        page: +page_number,
        limit: +limit,
        totalFinances,
        totalPages: Math.ceil(totalFinances / limit),
      },
    };
  }

  async findOne(finance_id: number, email: string) {
    const finance = await this.prisma.finance.findUnique({
      where: {
        id: finance_id,
      },
      include: {
        user: true,
      },
    });

    if (!finance) {
      throw new HttpException(
        'Invalid or inexisting finance',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (finance.user.email !== email) {
      throw new HttpException(
        'Invalid or inexisting finance',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { id, type, description, value } = finance;

    return {
      id,
      type,
      description,
      value,
    };
  }

  async update(id: number, updateFinanceDto: UpdateFinanceDto, email: string) {
    const finance = await this.prisma.finance.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!finance) {
      throw new HttpException(
        'Invalid or inexisting finance',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (finance.user.email !== email) {
      throw new HttpException(
        'Invalid or inexisting finance',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedFinance = await this.prisma.finance.update({
      where: {
        id,
      },
      data: updateFinanceDto,
    });

    return updatedFinance;
  }

  async remove(id: number, email: string) {
    const finance = await this.prisma.finance.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!finance) {
      throw new HttpException(
        'Invalid or inexisting finance',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (finance.user.email !== email) {
      throw new HttpException(
        'Invalid or inexisting finance',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.finance.delete({
      where: {
        id: finance.id,
      },
    });
  }
}
