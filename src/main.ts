import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './provider/prisma/prisma.service';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import Redis from 'ioredis';

const RedisStore = connectRedis(session);

// add environment variable
const redisClient = new Redis('redis://localhost:6379');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Finances API')
    .setDescription('finances api interview challenge')
    .setVersion('1.0')
    .addTag('finances')
    .addCookieAuth('optional-session-id')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 15,
      },
    }),
  );
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(8000);
}
bootstrap();
