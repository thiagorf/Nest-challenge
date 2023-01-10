import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AUTH_ERRORS } from './auth.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp().getRequest<Request>();

    const session = ctx.session;
    if (session && session.user) {
      const user = await this.auth.whoIAm(session.user.email);

      return !!user;
    }

    throw new HttpException(
      AUTH_ERRORS.UNAUTHORIZED_EXCEPTION,
      HttpStatus.UNAUTHORIZED,
    );
    //return false;
  }
}
