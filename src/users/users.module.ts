import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PasswordHashModule } from 'src/provider/password-hash/password-hash.module';

@Module({
  imports: [PasswordHashModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
