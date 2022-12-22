import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { PasswordHashService } from 'src/provider/password-hash/password-hash.service';
import { PrismaService } from 'src/provider/prisma/prisma.service';
import { UsersService } from './users.service';

const oneUser = {
  id: 1,
  name: 'john',
  email: 'john@gmail.com',
  password: '1234',
};

const userArray = [oneUser];

const passwordHash = {
  hashPassword: jest.fn().mockResolvedValue('hashedPassword'),
};

const prisma = {
  user: {
    findMany: jest.fn().mockResolvedValue(userArray),
    findUnique: jest.fn().mockResolvedValue(oneUser),
    findFirst: jest.fn().mockResolvedValue(oneUser),
    create: jest.fn().mockReturnValue(oneUser),
    save: jest.fn(),
    update: jest.fn().mockResolvedValue(oneUser),
    delete: jest.fn().mockResolvedValue(oneUser),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let passwordService: PasswordHashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: PasswordHashService,
          useValue: passwordHash,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    passwordService = module.get<PasswordHashService>(PasswordHashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create user', () => {
    it('should create an user', async () => {
      const user = await service.create(oneUser);

      expect(user).toHaveProperty('id');
      expect(user.id).toEqual(oneUser.id);
    });

    it('should hash the user password', async () => {
      await service.create(oneUser);

      expect(passwordService.hashPassword).toHaveBeenCalled();
      expect(passwordService.hashPassword).toReturn();
      expect(passwordService.hashPassword).toBeCalledWith(oneUser.password);
      expect(passwordService.hashPassword).toReturnWith;
    });

    it('should not return the user password', async () => {
      const user = await service.create(oneUser);

      expect(user).not.toHaveProperty('password');
    });
  });
});
