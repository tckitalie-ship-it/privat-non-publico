import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';

import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  // Stripe webhook: mantiene il corpo della richiesta in formato RAW.
  app.use(
    '/api/billing/webhook',
    express.raw({ type: 'application/json' }),
  );

  app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',

    'http://localhost:3002',
    'http://127.0.0.1:3002',

    'http://192.168.1.138:3000',
    'http://192.168.1.138:3002',

    'https://privat-non-publico-web-tckitalie-ship-its-projects.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;

  await app.listen(port, '0.0.0.0');

  console.log(`API running on port ${port}`);
}

bootstrap();
