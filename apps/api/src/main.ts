import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.enableCors({
  origin: true,
  credentials: true,
});

  app.setGlobalPrefix('api');

  // 🔥 IMPORTANTE per Stripe webhook
  app.use(
    '/api/billing/webhook',
    bodyParser.raw({ type: 'application/json' }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3001, '0.0.0.0');

  console.log('API running on http://127.0.0.1:3001/api');
}

bootstrap();

setInterval(() => {
  // keep process alive on Windows
}, 1000);