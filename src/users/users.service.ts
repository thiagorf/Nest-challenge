import { Injectable } from '@nestjs/common';
import { PasswordHashService } from 'src/provider/password-hash/password-hash.service';
import { PrismaService } from 'src/provider/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

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
    const userOrThrow = await this.prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
      select: this.userSelect,
    });

    return userOrThrow;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userOrThrow = await this.prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    });
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userOrThrow.id,
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
