import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class CheckAuthCookieMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
      const isUserOk = await this.authService.whoIAm(req.session.user.email);
      if (isUserOk) {
        return next();
      }
    }
    throw new HttpException(
      'you have to logged in to access this resource',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
