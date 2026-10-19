import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
    if (!process.env[key]) throw new Error(`Thiếu biến môi trường ${key} (xem file .env.example)`);
  }
  // Import sau khi đã nạp .env để các module đọc được JWT_SECRET
  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',') });
  app.enableShutdownHooks();
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  console.log(`API chạy tại http://localhost:${port}`);
}
bootstrap();
