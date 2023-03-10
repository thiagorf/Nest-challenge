import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PasswordHashService } from 'src/provider/password-hash/password-hash.service';
import { PrismaService } from 'src/provider/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { AUTH_ERRORS } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordHash: PasswordHashService,
  ) {}

  userSelect = {
    id: true,
    name: true,
    email: true,
  };

  async whoIAm(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: this.userSelect,
    });
    if (!user) {
      throw new HttpException(
        AUTH_ERRORS.INVALID_EXCEPTION,
        HttpStatus.BAD_REQUEST,
      );
    }

    return user;
  }

  async singIn({ email, password }: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException(
        AUTH_ERRORS.CREDENTIALS_EXCEPTION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordMatch = await this.passwordHash.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new HttpException(
        AUTH_ERRORS.CREDENTIALS_EXCEPTION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { id, name, email: userEmail } = user;
    const userInformation = { id, name, userEmail };

    return userInformation;
  }
}
