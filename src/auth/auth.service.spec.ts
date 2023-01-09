import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PasswordHashService } from 'src/provider/password-hash/password-hash.service';
import { PrismaService } from 'src/provider/prisma/prisma.service';
import { AuthService } from './auth.service';
import { AUTH_ERRORS } from './auth.constants';

const sessionEmail = 'john@gmail.com';

const oneUser = {
  id: 1,
  name: 'john',
  email: sessionEmail,
  password: 'UHKJAHSD128',
};

const prismaDb = {
  user: {
    findUnique: jest.fn().mockResolvedValue(oneUser),
  },
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let passwordHash: PasswordHashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PrismaService, useValue: prismaDb },
        AuthService,
        PasswordHashService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    passwordHash = module.get<PasswordHashService>(PasswordHashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Who I Am method', () => {
    it('should be able to identify an user', async () => {
      const { id, name, email } = oneUser,
        userWithoutPassword = { id, name, email };
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValueOnce(userWithoutPassword as User);
      const sut = await service.whoIAm(sessionEmail);

      expect(sut).not.toBeUndefined();
      expect(sut).not.toHaveProperty('password');
    });

    it('should be able to throw an errror when is passed an invalid email', () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      expect(async () => {
        await service.whoIAm(sessionEmail);
      }).rejects.toThrow(AUTH_ERRORS.INVALID_EXCEPTION);
    });
  });

  describe('sign in user', () => {
    it('should be able to check if an user is valid to sign in', async () => {
      jest.spyOn(passwordHash, 'comparePassword').mockResolvedValueOnce(true);
      const sut = await service.singIn(oneUser);

      expect(sut).not.toHaveProperty('password');
      expect(sut).toBeDefined();
    });
    it('should not be able to sign in an invalid user', () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      expect(async () => {
        await service.singIn(oneUser);
      }).rejects.toThrow(AUTH_ERRORS.CREDENTIALS_EXCEPTION);
    });
    it('should not be able to sign in a valid user with a mismatch password', () => {
      jest.spyOn(passwordHash, 'comparePassword').mockResolvedValueOnce(false);
      expect(async () => {
        await service.singIn(oneUser);
      }).rejects.toThrow(AUTH_ERRORS.CREDENTIALS_EXCEPTION);
    });
  });
});
