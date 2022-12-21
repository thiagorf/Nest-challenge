import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PasswordHashModule } from 'src/provider/password-hash/password-hash.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PasswordHashModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
