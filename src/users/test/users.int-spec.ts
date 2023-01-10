import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PasswordHashService } from 'src/provider/password-hash/password-hash.service';
import { PrismaService } from 'src/provider/prisma/prisma.service';
import { User } from '../entities/user.entity';
import { UsersService } from '../users.service';
import { USER_ERRORS } from '../users.constants';

const user = {
  name: 'John',
  email: 'john@gmail.com',
  password: 'john1234',
};

describe('users integration test', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let passwordHash: PasswordHashService;

  let createdUser: User;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<UsersService>(UsersService);
    passwordHash = module.get<PasswordHashService>(PasswordHashService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.finance.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.finance.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('create user', () => {
    it('should be able to create an user', async () => {
      const sut = await service.create(user);

      createdUser = sut;

      expect(sut).toHaveProperty('id');
    });
    it('should not be able to create an user with duplicate email', () => {
      expect(async () => {
        await service.create(user);
      }).rejects.toThrow(USER_ERRORS.DUPLICATE_EMAIL_EXCEPTION);
    });
    it('should be able to proper hash the password', async () => {
      const passwordHashSpy = jest.spyOn(passwordHash, 'hashPassword');

      await service.create({
        ...user,
        email: 'anotheremail@gmail.com',
      });

      expect(passwordHashSpy).toHaveBeenCalled();
      expect(passwordHashSpy).toHaveBeenCalledWith(user.password);
    });
  });

  describe('find one', () => {
    it('should be able to return a user', async () => {
      const sut = await service.findOne(createdUser.id);

      expect(sut.email).toBe(user.email);
    });
    it('should throw a error', () => {
      expect(async () => {
        await service.findOne(999);
      }).rejects.toThrow(USER_ERRORS.INVALID_EXCEPTION);
    });
  });

  describe('find all', () => {
    it('should be able to return all users with the number of finances', async () => {
      const sut = await service.findAll();

      expect(sut.length).toBe(2);
      expect(sut[0]._count.finances).toBe(0);
    });
  });
  describe('update user', () => {
    it('should be able to update an user', async () => {
      const sut = await service.update(createdUser.id, {
        ...user,
        email: 'updated@gmail.com',
      });

      expect(sut.email).not.toBe(user.email);
    });
    it('should not be able to update an invalid user', () => {
      expect(async () => {
        await service.update(9999, {
          ...user,
          email: 'updated@gmail.com',
        });
      }).rejects.toThrow(USER_ERRORS.INVALID_EXCEPTION);
    });
  });
  describe('delete user', () => {
    it('should be able to delete an user', async () => {
      await service.remove(createdUser.id);

      const sut = await service.findAll();

      expect(sut.length).toBe(1);
    });
    it('should not be able to delete an invalid user', () => {
      expect(async () => {
        await service.remove(9999);
      }).rejects.toThrow(USER_ERRORS.INVALID_EXCEPTION);
    });
  });
});
