import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Session as GetSession,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Session } from 'express-session';
import { ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { UserFinance } from './entities/user-finance.entity';
import { Userbalance } from './entities/user-balance.entity';
import { USER_DELETED, USER_ERRORS } from './users.constants';
import { AUTH_ERRORS } from 'src/auth/auth.constants';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('balance')
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    type: Userbalance,
  })
  @ApiResponse({
    status: 400,
    description: USER_ERRORS.INVALID_EXCEPTION,
  })
  @ApiResponse({
    status: 401,
    description: AUTH_ERRORS.UNAUTHORIZED_EXCEPTION,
  })
  getBalance(@GetSession() session: Session) {
    return this.usersService.getBalance(session.user.email);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: USER_ERRORS.DUPLICATE_EMAIL_EXCEPTION,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: UserFinance,
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: USER_ERRORS.INVALID_EXCEPTION,
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: USER_ERRORS.INVALID_EXCEPTION,
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: USER_DELETED,
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
