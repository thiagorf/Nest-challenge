import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FinancesModule } from './finances/finances.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CheckAuthCookieMiddleware } from './middleware/check-auth-cookie/check-auth-cookie.middleware';
import { PrismaModule } from './provider/prisma/prisma.module';
import { PasswordHashModule } from './provider/password-hash/password-hash.module';

@Module({
  imports: [
    FinancesModule,
    UsersModule,
    ConfigModule.forRoot(),
    AuthModule,
    PrismaModule,
    PasswordHashModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckAuthCookieMiddleware).forRoutes('finances');
  }
}
