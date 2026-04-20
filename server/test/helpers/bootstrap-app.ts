import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';

export async function createE2eApplication(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
}

export async function truncateStoresAndProducts(
  app: INestApplication,
): Promise<void> {
  const ds = app.get(DataSource);
  await ds.query('TRUNCATE TABLE stores RESTART IDENTITY CASCADE;');
  await ds.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE;');
}
