import type { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../src/category/entities/category.entity';

export async function seedCategory(
  app: INestApplication,
  name: string,
): Promise<string> {
  const repo = app.get<Repository<Category>>(getRepositoryToken(Category));
  const saved = await repo.save(repo.create({ name }));
  return saved.id;
}
