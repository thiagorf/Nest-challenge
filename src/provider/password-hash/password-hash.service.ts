import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

@Injectable()
export class PasswordHashService {
  async hashPassword(password: string) {
    const salt = Number(process.env.PASSWORD_SALT);

    const hashedPassword = await hash(password, salt);

    return hashedPassword;
  }

  async comparePassword(providedPassword: string, hashedPassword: string) {
    const isPasswordOk = await compare(providedPassword, hashedPassword);
    //throw error when is false?
    return isPasswordOk;
  }
}
