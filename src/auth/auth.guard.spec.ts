import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { PasswordHashService } from 'src/provider/password-hash/password-hash.service';
import { PrismaService } from 'src/provider/prisma/prisma.service';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { AUTH_ERRORS } from './auth.constants';

const oneUser = {
  id: 1,
  name: 'john',
  email: 'john@gmail.com',
  password: '1234',
};

const auth = {
  whoIAm: jest
    .fn()
    .mockRejectedValue(
      new HttpException(AUTH_ERRORS.INVALID_EXCEPTION, HttpStatus.BAD_REQUEST),
    ),
};

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: auth },
        PrismaService,
        PasswordHashService,
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should not be able to proceed with a session', () => {
    const ctx = createMock<ExecutionContext>();

    ctx.switchToHttp().getRequest.mockReturnValue({
      session: null,
    });

    expect(async () => await guard.canActivate(ctx)).rejects.toThrow(
      AUTH_ERRORS.UNAUTHORIZED_EXCEPTION,
    );
  });

  it('should not be able to proceed with an invalid user', async () => {
    const ctx = createMock<ExecutionContext>();

    ctx.switchToHttp().getRequest.mockReturnValue({
      session: {
        user: {
          email: oneUser.email,
        },
      },
    });

    expect(async () => await guard.canActivate(ctx)).rejects.toThrow(
      AUTH_ERRORS.INVALID_EXCEPTION,
    );
  });

  it('should be able to proceed with a valid user', async () => {
    const ctx = createMock<ExecutionContext>();

    ctx.switchToHttp().getRequest.mockReturnValue({
      session: {
        user: {
          email: oneUser.email,
        },
      },
    });

    jest.spyOn(authService, 'whoIAm').mockResolvedValue(oneUser);

    const pass = await guard.canActivate(ctx);
    expect(pass).toBeTruthy;
    expect(authService.whoIAm).toHaveBeenCalled();
  });
});
