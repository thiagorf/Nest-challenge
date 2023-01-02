import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PasswordHashService } from 'src/provider/password-hash/password-hash.service';
import { PrismaService } from 'src/provider/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordHash: PasswordHashService,
  ) {}

  userSelect = {
    id: true,
    name: true,
    email: true,
  };

  async create(createUserDto: CreateUserDto) {
    const emailIsAvailable = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (emailIsAvailable) {
      throw new HttpException(
        'Email has already been in use.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await this.passwordHash.hashPassword(
      createUserDto.password,
    );
    const user = await this.prisma.user.create({
      data: { ...createUserDto, password: hashedPassword },
    });

    const { id, name, email } = user;

    return { id, name, email };
  }

  async findAll() {
    return await this.prisma.user.findMany({
      select: {
        ...this.userSelect,
        _count: {
          select: {
            finances: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: this.userSelect,
    });

    if (!user) {
      throw new HttpException(
        'Invalid or inexisting user',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException(
        'Invalid or inexisting user',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: updateUserDto,
      select: this.userSelect,
    });

    return updatedUser;
  }

  async remove(id: number) {
    const userOrThrow = await this.prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    });

    await this.prisma.user.delete({
      where: {
        id: userOrThrow.id,
      },
    });

    return {
      msg: 'User deleted',
    };
  }

  async getBalance(user_email: string) {
    const userWithFinances = await this.prisma.user.findUnique({
      where: {
        email: user_email,
      },
      include: {
        finances: true,
      },
    });

    const incomeAndExpense = {
      income: 0,
      expense: 0,
    };

    userWithFinances.finances.forEach((finance) => {
      if (finance.type === 'income') {
        incomeAndExpense.income += finance.value;
      } else {
        incomeAndExpense.expense += finance.value;
      }
    });

    const { id, name, email } = userWithFinances;
    const { income, expense } = incomeAndExpense;

    const balance = income - expense;

    return {
      id,
      name,
      email,
      total_balance: balance,
    };
  }
}
