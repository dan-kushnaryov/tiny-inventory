import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

describe('CategoryController', () => {
  let controller: CategoryController;
  const categoryService = { findAll: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: categoryService }],
    }).compile();
    controller = module.get(CategoryController);
  });

  it('GET list maps rows to DTOs', async () => {
    const now = new Date();
    categoryService.findAll.mockResolvedValue([
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'A',
        createdAt: now,
        updatedAt: now,
      },
    ]);
    const out = await controller.findAll();
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('11111111-1111-4111-8111-111111111111');
    expect(out[0].name).toBe('A');
  });
});
