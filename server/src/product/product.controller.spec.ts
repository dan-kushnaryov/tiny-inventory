import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

const PID = '10000000-0000-4000-8000-000000000001';
const CAT_ID = '11111111-1111-4111-8111-111111111111';

describe('ProductController', () => {
  let controller: ProductController;
  const productService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: productService }],
    }).compile();
    controller = module.get(ProductController);
  });

  it('rejects invalid include before service', async () => {
    await expect(
      controller.findAll({ include: 'nope' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(productService.findAll).not.toHaveBeenCalled();
  });

  it('findAll passes query to service and maps response', async () => {
    productService.findAll.mockResolvedValue({
      items: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    });
    const out = await controller.findAll({ include: 'store' } as never);
    expect(productService.findAll).toHaveBeenCalled();
    expect(out.items).toEqual([]);
  });

  it('create maps product', async () => {
    const now = new Date();
    const product = {
      id: PID,
      name: 'N',
      category: { id: CAT_ID, name: 'C' },
      price: '1.00',
      quantityInStock: 1,
      storeId: '00000000-0000-4000-8000-000000000001',
      createdAt: now,
      updatedAt: now,
    };
    productService.create.mockResolvedValue(product);
    const dto = await controller.create({
      name: 'N',
      categoryId: CAT_ID,
      price: 1,
      quantityInStock: 1,
      storeId: '00000000-0000-4000-8000-000000000001',
    });
    expect(dto.name).toBe('N');
  });

  it('update maps product', async () => {
    const now = new Date();
    const product = {
      id: PID,
      name: 'U',
      category: { id: CAT_ID, name: 'C' },
      price: '2.00',
      quantityInStock: 2,
      storeId: '00000000-0000-4000-8000-000000000001',
      createdAt: now,
      updatedAt: now,
    };
    productService.update.mockResolvedValue(product);
    const dto = await controller.update(PID, { name: 'U' });
    expect(dto.price).toBe(2);
  });

  it('remove delegates to service', async () => {
    productService.remove.mockResolvedValue(undefined);
    await controller.remove(PID);
    expect(productService.remove).toHaveBeenCalledWith(PID);
  });

  it('findOne maps with embedded store when include requests it', async () => {
    const now = new Date();
    const sid = '00000000-0000-4000-8000-000000000001';
    const store = {
      id: sid,
      name: 'S',
      address: null,
      products: [],
      createdAt: now,
      updatedAt: now,
    };
    const product = {
      id: PID,
      name: 'P',
      category: { id: CAT_ID, name: 'C' },
      price: '1.00',
      quantityInStock: 1,
      storeId: sid,
      store,
      createdAt: now,
      updatedAt: now,
    };
    productService.findOne.mockResolvedValue(product);
    const dto = await controller.findOne(PID, { include: 'store' });
    expect(dto.id).toBe(PID);
    expect(dto.store?.name).toBe('S');
  });
});
