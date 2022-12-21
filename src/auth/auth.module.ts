import { Module } from '@nestjs/common';
import { PasswordHashModule } from 'src/provider/password-hash/password-hash.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [PasswordHashModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
