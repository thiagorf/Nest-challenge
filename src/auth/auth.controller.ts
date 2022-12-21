import {
  Controller,
  Post,
  Get,
  Session as GetSession,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { Session } from 'express-session';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

//type UserSession = Session & Record<'user', any>;

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  async me(@GetSession() session: Session) {
    if (!session.user) {
      throw new UnauthorizedException('Not authenticated');
    }

    return await this.authService.whoIAm(session.user.email);
  }

  @Post('login')
  async login(@Body() loginDto: AuthDto, @GetSession() session: Session) {
    const userData = await this.authService.singIn(loginDto);

    session.user = {
      email: userData.userEmail,
    };

    return {
      msg: 'successfully logged in.',
    };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@GetSession() session: Session) {
    // check latter
    return new Promise((resolve, reject) => {
      session.destroy((err) => {
        if (err) reject(err);
        resolve(undefined);
      });
    });
  }
}
