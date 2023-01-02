import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/provider/prisma/prisma.service';
import { CreateFinanceDto } from '../dto/create-finance.dto';
import { FinancesService } from '../finances.service';

const sessionEmail = 'test@gmail.com';

const financeIncome: CreateFinanceDto = {
  type: 'income',
  description: 'job',
  value: 200,
};

const financeExpense: CreateFinanceDto = {
  type: 'expense',
  description: 'book',
  value: 50,
};

describe('Finances integration tests', () => {
  let prisma: PrismaService;
  let service: FinancesService;

  let userId: number;

  // Default params value
  const limit = 10;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = module.get(PrismaService);
    service = module.get(FinancesService);

    //Add cascade delete?
    await prisma.finance.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        name: 'test',
        email: sessionEmail,
        password: '1234',
      },
    });

    userId = user.id;
  });

  describe('create finance', () => {
    it('should be able to create a finance', async () => {
      const sut = await service.create(
        {
          type: 'income',
          description: 'job',
          value: 2000,
        },
        sessionEmail,
      );

      expect(sut).toHaveProperty('id');
      expect(sut.user_id).toBe(userId);
    });
  });
  describe('get paginated finances', () => {
    it('should return some finances', async () => {
      const sut = await service.findAll({}, sessionEmail);

      expect(sut.finances.length).toBe(1);
      expect(sut.pagination.totalPages).toBe(1);
    });

    it('should be able to use the default limit param', async () => {
      const income = { ...financeIncome, user_id: userId };
      const expense = { ...financeExpense, user_id: userId };
      const finances = await prisma.finance.createMany({
        data: [
          income,
          income,
          expense,
          expense,
          income,
          income,
          expense,
          expense,
          income,
          income,
        ],
      });

      const sut = await service.findAll({}, sessionEmail);

      // limit = 10
      expect(sut.finances.length).toBe(limit);
      expect(sut.pagination.totalPages).toBe(2);
      expect(sut.pagination.limit).toBe(limit);
      // +1 from the previous created finance
      expect(sut.pagination.totalFinances).toBe(finances.count + 1);
    });

    it('should change total pages based on limit param', async () => {
      const newLimit = 3;
      const totalFinances = 11;
      const expectedPageNumber = Math.ceil(totalFinances / newLimit);

      const sut = await service.findAll(
        {
          limit: newLimit,
        },
        sessionEmail,
      );

      expect(sut.finances.length).toBe(newLimit);
      expect(sut.pagination.totalPages).toBe(expectedPageNumber);

      const lastPage = await service.findAll(
        {
          limit: newLimit,
          page_number: sut.pagination.totalPages,
        },
        sessionEmail,
      );

      expect(lastPage.finances.length).toBe(2);
    });

    it('should be able to get finances in the second page', async () => {
      const sut = await service.findAll(
        {
          page_number: 2,
        },
        sessionEmail,
      );
      expect(sut.pagination.page).toBe(2);
      expect(sut.finances.length).toBe(1);
    });

    it('should filter finances based on date', async () => {
      const mockDateObject = new Date('2022-12-31');

      const dateSpy = jest
        .spyOn(global, 'Date')
        .mockReturnValue(mockDateObject as unknown as string);

      await prisma.finance.create({
        data: {
          type: 'income',
          description: 'new job',
          value: 6000,
          user_id: userId,
          created_at: mockDateObject,
        },
      });

      dateSpy.mockRestore();

      const sut = await service.findAll(
        {
          start_at: new Date('2022-12-29'),
          ends_at: new Date('2022-12-31'),
        },
        sessionEmail,
      );

      expect(sut).not.toBeNull();
      expect(sut.finances.length).toBe(1);
      expect(sut.pagination.totalFinances).toBe(1);
    });
  });
});
