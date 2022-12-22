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

const finances = [
  {
    id: 1,
    type: 'income',
    description: 'Job',
    value: 2000,
  },
  {
    id: 2,
    type: 'expense',
    description: 'food',
    value: 400,
  },
];

const userWithFinances = { ...oneUser, finances };

const userArray = [oneUser];

const passwordHash = {
  hashPassword: jest.fn().mockResolvedValue('hashedPassword'),
};

const prismaDB = {
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
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        AuthService,
        { provide: PrismaService, useValue: prismaDB },
        {
          provide: PasswordHashService,
          useValue: passwordHash,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    passwordService = module.get<PasswordHashService>(PasswordHashService);
    prisma = module.get<PrismaService>(PrismaService);
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

  describe('get balance', () => {
    it('should be able to return user finances', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userWithFinances);

      const userBalance = await service.getBalance(userWithFinances.email);

      expect(userBalance).toHaveProperty('total_balance');
      expect(userBalance.total_balance).toEqual(1600);
    });
  });
});
