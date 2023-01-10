import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/provider/prisma/prisma.service';
import * as request from 'supertest';
import * as session from 'express-session';
import { AppModule } from '../../app.module';
import { USER_DELETED, USER_ERRORS } from '../users.constants';
import { NextFunction, Request, Response } from 'express';
import { AUTH_ERRORS } from 'src/auth/auth.constants';

const user = {
  name: 'john',
  email: 'john@gmail.com',
  password: '1234',
};

describe('Users endpoint (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let oneUser: {
    id: number;
    name: string;
    email: string;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await prisma.finance.deleteMany();
    await prisma.user.deleteMany();
    await app.init();

    oneUser = await prisma.user.create({
      data: { ...user, email: 'john34@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users', () => {
    describe('/ (POST)', () => {
      it('should be able to create an user', async () => {
        const beforeCount = await prisma.user.count();
        const { status, body } = await request(app.getHttpServer())
          .post('/users')
          .send(user);

        const afterCount = await prisma.user.count();

        expect(status).toBe(201);
        expect(afterCount).toBeGreaterThan(beforeCount);
        expect(body).toHaveProperty('id');
      });
      it('should not be able to create an user with duplicated email', async () => {
        const { status, body } = await request(app.getHttpServer())
          .post('/users')
          .send(user);

        expect(status).toBe(400);
        expect(body).toHaveProperty('message');
        expect(body.message).toBe(USER_ERRORS.DUPLICATE_EMAIL_EXCEPTION);
      });
    });

    it('/ (GET)', async () => {
      const { status, body } = await request(app.getHttpServer()).get('/users');

      expect(status).toBe(200);
      expect(body.length).toBe(2);
    });

    describe('/:id (GET)', () => {
      it('should be able to retreive an user', async () => {
        const { status, body } = await request(app.getHttpServer()).get(
          `/users/${oneUser.id}`,
        );

        expect(status).toBe(200);
        expect(body).toEqual(oneUser);
      });
      it('should not be able to retreive an user with invalid ID', async () => {
        const { status, body } = await request(app.getHttpServer()).get(
          '/users/0',
        );

        expect(status).toBe(400);
        expect(body.message).toBe(USER_ERRORS.INVALID_EXCEPTION);
      });
    });

    describe('/:id (PATCH)', () => {
      it('should ne able to update an user', async () => {
        const { status, body } = await request(app.getHttpServer())
          .patch(`/users/${oneUser.id}`)
          .send({ ...oneUser, name: 'john doe' });

        expect(status).toBe(200);
        expect(body.name).not.toEqual(oneUser.name);
      });

      it('should not be able to update an invalid user', async () => {
        const { status, body } = await request(app.getHttpServer()).patch(
          '/users/0',
        );

        expect(status).toBe(400);
        expect(body.message).toBe(USER_ERRORS.INVALID_EXCEPTION);
      });
      it.todo(
        'should not be able to update an user with an already regists email',
      );
    });

    //auth
    describe('/users/balance', () => {
      it('should be able to get users balance', async () => {
        const fixedSessionModule: TestingModule =
          await Test.createTestingModule({
            imports: [AppModule],
          }).compile();

        const appSession = fixedSessionModule.createNestApplication();

        appSession.use(
          session({
            genid: function () {
              return 'sessionID';
            },
            secret: 'something',
            resave: false,
            saveUninitialized: false,
            cookie: {
              httpOnly: true,
              maxAge: 1000 * 60 * 15,
            },
          }),
        );
        appSession.use('*', (req: Request, _: Response, next: NextFunction) => {
          req.session.user = {
            email: oneUser.email,
          };

          return next();
        });
        await appSession.init();

        const { status, body, headers } = await request(
          appSession.getHttpServer(),
        ).get('/users/balance');

        expect(status).toBe(200);
        expect(body).toHaveProperty('total_balance');
        expect(body.total_balance).not.toBeLessThan(0);
        expect(headers['set-cookie'][0]).not.toBeUndefined();

        await appSession.close();
      });
      it('should not be able to get balance for an unauthorized user', async () => {
        const { status, body } = await request(app.getHttpServer()).get(
          '/users/balance',
        );

        expect(status).toBe(401);
        expect(body.message).toBe(AUTH_ERRORS.UNAUTHORIZED_EXCEPTION);
      });
    });

    describe('/:id (DELETE)', () => {
      it('should be able to delete an user', async () => {
        const deleteUser = await prisma.user.create({
          data: { ...user, email: 'johndoe123122@gmail.com' },
        });

        const { status, body } = await request(app.getHttpServer()).delete(
          `/users/${deleteUser.id}`,
        );

        expect(status).toBe(200);
        expect(body.msg).toBe(USER_DELETED);
      });

      it('should not be able to delete an invalid user', async () => {
        const { status, body } = await request(app.getHttpServer()).delete(
          '/users/0',
        );

        expect(status).toBe(400);
        expect(body.message).toBe(USER_ERRORS.INVALID_EXCEPTION);
      });
    });
  });
});
