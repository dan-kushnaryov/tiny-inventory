import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoreNotFoundException } from '../store/exceptions/store-not-found.exception';
import { StoreService } from '../store/store.service';
import { Category } from '../category/entities/category.entity';
import { Product } from './entities/product.entity';
import { CategoryNotFoundException } from './exceptions/category-not-found.exception';
import { ProductNotFoundException } from './exceptions/product-not-found.exception';
import { ProductService } from './product.service';

const PID = '10000000-0000-4000-8000-000000000001';
const SID = '00000000-0000-4000-8000-000000000001';
const CAT_ID = '11111111-1111-4111-8111-111111111111';

describe('ProductService', () => {
  let service: ProductService;
  const storeService = { findOne: vi.fn() };
  const categoryRepository = {
    findOne: vi.fn(),
  };
  const qb = {
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
  };
  const productRepository = {
    create: vi.fn((x: object) => x),
    save: vi.fn(),
    createQueryBuilder: vi.fn(() => qb),
    findOne: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    categoryRepository.findOne.mockResolvedValue({
      id: CAT_ID,
      name: 'C',
    } as Category);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(Product), useValue: productRepository },
        { provide: getRepositoryToken(Category), useValue: categoryRepository },
        { provide: StoreService, useValue: storeService },
      ],
    }).compile();
    service = module.get(ProductService);
  });

  it('create validates store and saves', async () => {
    storeService.findOne.mockResolvedValue({ id: SID });
    const resolved = { id: CAT_ID, name: 'C' } as Category;
    const saved = { id: PID, category: resolved } as Product;
    productRepository.save.mockResolvedValue(saved);
    productRepository.findOne.mockResolvedValue(saved);
    const out = await service.create({
      name: 'N',
      categoryId: CAT_ID,
      price: 1.2,
      quantityInStock: 1,
      storeId: SID,
    });
    expect(storeService.findOne).toHaveBeenCalledWith(SID);
    expect(categoryRepository.findOne).toHaveBeenCalledWith({
      where: { id: CAT_ID },
    });
    expect(productRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'N',
        price: '1.20',
        storeId: SID,
        category: resolved,
      }),
    );
    expect(out).toBe(saved);
  });

  it('create propagates missing store', async () => {
    storeService.findOne.mockRejectedValue(new StoreNotFoundException(SID));
    await expect(
      service.create({
        name: 'N',
        categoryId: CAT_ID,
        price: 1,
        quantityInStock: 1,
        storeId: SID,
      }),
    ).rejects.toBeInstanceOf(StoreNotFoundException);
  });

  it('create throws when category id is unknown', async () => {
    storeService.findOne.mockResolvedValue({ id: SID });
    categoryRepository.findOne.mockResolvedValue(null);
    await expect(
      service.create({
        name: 'N',
        categoryId: CAT_ID,
        price: 1,
        quantityInStock: 1,
        storeId: SID,
      }),
    ).rejects.toBeInstanceOf(CategoryNotFoundException);
  });

  it('findAll rejects invalid price range', async () => {
    await expect(
      service.findAll({
        minPrice: 10,
        maxPrice: 5,
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('findAll rejects invalid stock range', async () => {
    await expect(
      service.findAll({
        minStock: 10,
        maxStock: 2,
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('findAll uses query builder and join when include store', async () => {
    qb.getManyAndCount.mockResolvedValue([[], 0]);
    await service.findAll({ include: 'store' } as never);
    expect(productRepository.createQueryBuilder).toHaveBeenCalledWith(
      'product',
    );
    expect(qb.leftJoinAndSelect).toHaveBeenCalled();
    expect(qb.getManyAndCount).toHaveBeenCalled();
  });

  it('findAll applies optional filters', async () => {
    qb.getManyAndCount.mockResolvedValue([[], 0]);
    await service.findAll({
      storeId: SID,
      categoryId: '22222222-2222-4222-8222-222222222222',
      minPrice: 1,
      maxPrice: 10,
      minStock: 0,
      maxStock: 100,
    } as never);
    expect(qb.andWhere).toHaveBeenCalled();
  });

  it('findOne loads product', async () => {
    const p = { id: PID } as Product;
    productRepository.findOne.mockResolvedValue(p);
    const out = await service.findOne(PID, {});
    expect(out).toBe(p);
  });

  it('findOne throws when missing', async () => {
    productRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne(PID, {})).rejects.toBeInstanceOf(
      ProductNotFoundException,
    );
  });

  it('update with empty patch returns current', async () => {
    const p = { id: PID } as Product;
    productRepository.findOne.mockResolvedValue(p);
    const out = await service.update(PID, {});
    expect(productRepository.update).not.toHaveBeenCalled();
    expect(out).toBe(p);
  });

  it('update validates new storeId', async () => {
    storeService.findOne.mockResolvedValue({ id: SID });
    productRepository.update.mockResolvedValue({ affected: 1 });
    const p = { id: PID, storeId: SID } as Product;
    productRepository.findOne.mockResolvedValue(p);
    await service.update(PID, { storeId: SID });
    expect(storeService.findOne).toHaveBeenCalledWith(SID);
  });

  it('update converts price to two decimal string', async () => {
    productRepository.update.mockResolvedValue({ affected: 1 });
    const p = { id: PID, price: '9.50' } as Product;
    productRepository.findOne.mockResolvedValue(p);
    await service.update(PID, { price: 9.5 });
    expect(productRepository.update).toHaveBeenCalledWith(
      PID,
      expect.objectContaining({ price: '9.50' }),
    );
  });

  it('update maps categoryId to TypeORM relation shape', async () => {
    categoryRepository.findOne.mockResolvedValue({
      id: CAT_ID,
      name: 'C',
    } as Category);
    productRepository.update.mockResolvedValue({ affected: 1 });
    const p = { id: PID } as Product;
    productRepository.findOne.mockResolvedValue(p);
    await service.update(PID, { categoryId: CAT_ID });
    expect(productRepository.update).toHaveBeenCalledWith(
      PID,
      expect.objectContaining({
        category: { id: CAT_ID },
      }),
    );
  });

  it('update throws when affected is 0', async () => {
    productRepository.update.mockResolvedValue({ affected: 0 });
    await expect(service.update(PID, { name: 'X' })).rejects.toBeInstanceOf(
      ProductNotFoundException,
    );
  });

  it('remove throws when affected is 0', async () => {
    productRepository.delete.mockResolvedValue({ affected: 0 });
    await expect(service.remove(PID)).rejects.toBeInstanceOf(
      ProductNotFoundException,
    );
  });
});
