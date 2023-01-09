import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { PasswordHashService } from 'src/provider/password-hash/password-hash.service';
import { PrismaService } from 'src/provider/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { FinancesService } from './finances.service';
import { FINANCE_ERRORS } from './finances.constants';

const user = {
  id: 1,
  name: 'john',
  email: 'john@gmail.com',
};
const userFinance = {
  ...user,
  total_balance: 2000,
};

const financeDto: {
  type: 'income' | 'expense';
  description: string;
  value: number;
} = {
  type: 'income',
  description: 'Job',
  value: 2000,
};

const sessionEmail = userFinance.email;

const finance: {
  id: number;
  type: 'income' | 'expense';
  description: string;
  value: number;
  user_id: number;
} = {
  id: 1,
  type: 'income',
  description: 'Job',
  value: 2000,
  user_id: 1,
};

const finances = [finance];

const userMock = {
  getBalance: jest.fn().mockResolvedValue(userFinance),
};

const prismaMock = {
  finance: {
    findMany: jest.fn().mockResolvedValue(finances),
    findUnique: jest.fn().mockResolvedValue(finance),
    create: jest.fn().mockReturnValue(finance),
    update: jest.fn().mockResolvedValue(finance),
    delete: jest.fn().mockResolvedValue(finance),
  },
};

describe('FinancesService', () => {
  let service: FinancesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancesService,
        { provide: PrismaService, useValue: prismaMock },
        AuthService,
        { provide: UsersService, useValue: userMock },
        PasswordHashService,
      ],
    }).compile();

    service = module.get<FinancesService>(FinancesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create finance', () => {
    it('should be able to create a finance', async () => {
      const sut = await service.create(financeDto, sessionEmail);
      await service.create(
        { type: 'expense', value: 2000, description: 'PC' },
        sessionEmail,
      );

      expect(sut).toHaveProperty('id');
      expect(async () => {
        await service.create(
          { type: 'expense', value: 2000, description: 'PC' },
          sessionEmail,
        );
      }).not.toThrow(FINANCE_ERRORS.FUNDS_EXCEPTION);
    });

    it('should not be able to create a expense when the value is greater than the total balance', () => {
      const financeExpenseDto: typeof financeDto = {
        type: 'expense',
        value: 4000,
        description: 'PC',
      };

      expect(async () => {
        await service.create(financeExpenseDto, sessionEmail);
      }).rejects.toThrow(FINANCE_ERRORS.FUNDS_EXCEPTION);
    });
  });

  describe('find one', () => {
    it('should not be able to find an inexisting finance', async () => {
      jest.spyOn(prisma.finance, 'findUnique').mockResolvedValue(null);

      expect(async () => {
        await service.findOne(1, sessionEmail);
      }).rejects.toThrow(FINANCE_ERRORS.INVALID_EXCEPTION);
    });

    it('should not be able to get an unassociate finance for an user', () => {
      const financeWithUser = {
        ...finance,
        user: { ...user, email: 'anotheremail@gmail.com' },
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest
        .spyOn(prisma.finance, 'findUnique')
        .mockResolvedValue(financeWithUser);

      expect(async () => {
        await service.findOne(1, sessionEmail);
      }).rejects.toThrow(FINANCE_ERRORS.INVALID_EXCEPTION);
    });
    it('should be able to find one user', async () => {
      const financeWithUser = {
        ...finance,
        user: user,
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest
        .spyOn(prisma.finance, 'findUnique')
        .mockResolvedValue(financeWithUser);
      const sut = await service.findOne(finance.id, sessionEmail);

      expect(sut).not.toBeFalsy();
    });
  });
});
