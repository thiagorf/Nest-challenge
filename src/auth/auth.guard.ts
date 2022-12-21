import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp().getRequest<Request>();

    const session = ctx.session;
    if (session.user) {
      const user = await this.auth.whoIAm(session.user.email);

      return !!user;
    }

    return false;
  }
}
