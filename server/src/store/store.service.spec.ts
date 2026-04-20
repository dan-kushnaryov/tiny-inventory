import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Product } from '../product/entities/product.entity';
import { StoreNotFoundException } from './exceptions/store-not-found.exception';
import { Store } from './entities/store.entity';
import { StoreService } from './store.service';

const STORE_ID = '00000000-0000-4000-8000-000000000001';

describe('StoreService', () => {
  let service: StoreService;
  const storeRepository = {
    create: vi.fn((x: object) => x),
    save: vi.fn(),
    findAndCount: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const productRepository = {
    query: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: getRepositoryToken(Store), useValue: storeRepository },
        { provide: getRepositoryToken(Product), useValue: productRepository },
      ],
    }).compile();
    service = module.get(StoreService);
  });

  it('create saves a new store', async () => {
    const saved = { id: STORE_ID, name: 'N', address: null } as Store;
    storeRepository.save.mockResolvedValue(saved);
    const out = await service.create({ name: 'N', address: null });
    expect(storeRepository.create).toHaveBeenCalledWith({
      name: 'N',
      address: null,
    });
    expect(out).toBe(saved);
  });

  it('findAll returns paginated result', async () => {
    const items = [{ id: STORE_ID }] as Store[];
    storeRepository.findAndCount.mockResolvedValue([items, 1]);
    const r = await service.findAll({ page: 1, limit: 10 });
    expect(r.items).toBe(items);
    expect(r.meta.total).toBe(1);
  });

  it('findOne throws when missing', async () => {
    storeRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne(STORE_ID)).rejects.toBeInstanceOf(
      StoreNotFoundException,
    );
  });

  it('findOne returns store', async () => {
    const s = { id: STORE_ID, name: 'X' } as Store;
    storeRepository.findOne.mockResolvedValue(s);
    await expect(service.findOne(STORE_ID)).resolves.toBe(s);
  });

  it('update with empty patch loads existing', async () => {
    const s = { id: STORE_ID, name: 'X' } as Store;
    storeRepository.findOne.mockResolvedValue(s);
    const out = await service.update(STORE_ID, {});
    expect(storeRepository.update).not.toHaveBeenCalled();
    expect(out).toBe(s);
  });

  it('update throws when affected is 0', async () => {
    storeRepository.update.mockResolvedValue({ affected: 0 });
    await expect(
      service.update(STORE_ID, { name: 'Y' }),
    ).rejects.toBeInstanceOf(StoreNotFoundException);
  });

  it('update returns reloaded store', async () => {
    storeRepository.update.mockResolvedValue({ affected: 1 });
    const reloaded = { id: STORE_ID, name: 'Y' } as Store;
    storeRepository.findOne.mockResolvedValue(reloaded);
    const out = await service.update(STORE_ID, { name: 'Y' });
    expect(out).toBe(reloaded);
  });

  it('remove throws when nothing deleted', async () => {
    storeRepository.delete.mockResolvedValue({ affected: 0 });
    await expect(service.remove(STORE_ID)).rejects.toBeInstanceOf(
      StoreNotFoundException,
    );
  });

  it('remove succeeds', async () => {
    storeRepository.delete.mockResolvedValue({ affected: 1 });
    await expect(service.remove(STORE_ID)).resolves.toBeUndefined();
  });

  it('getStoreStatsSnapshot throws when store missing', async () => {
    storeRepository.findOne.mockResolvedValue(null);
    await expect(
      service.getStoreStatsSnapshot(STORE_ID),
    ).rejects.toBeInstanceOf(StoreNotFoundException);
  });

  it('getStoreStatsSnapshot returns zeros when query row missing', async () => {
    storeRepository.findOne.mockResolvedValue({ id: STORE_ID } as Store);
    productRepository.query.mockResolvedValue([]);
    const snap = await service.getStoreStatsSnapshot(STORE_ID);
    expect(snap.totalProducts).toBe(0);
    expect(snap.categoryCounts).toEqual([]);
  });

  it('getStoreStatsSnapshot parses SQL row', async () => {
    storeRepository.findOne.mockResolvedValue({ id: STORE_ID } as Store);
    productRepository.query.mockResolvedValue([
      {
        total_value: '123.456',
        total_products: '4',
        low_stock_count: '1',
        category_rows: [{ category: 'A', productCount: 2 }],
      },
    ]);
    const snap = await service.getStoreStatsSnapshot(STORE_ID);
    expect(snap.totalInventoryValue).toBe(123.46);
    expect(snap.totalProducts).toBe(4);
    expect(snap.lowStockProductCount).toBe(1);
    expect(snap.categoryCounts).toEqual([{ category: 'A', productCount: 2 }]);
  });

  it('getStoreStatsSnapshot tolerates invalid category_rows JSON string', async () => {
    storeRepository.findOne.mockResolvedValue({ id: STORE_ID } as Store);
    productRepository.query.mockResolvedValue([
      {
        total_value: 0,
        total_products: 1,
        low_stock_count: 0,
        category_rows: 'not-json',
      },
    ]);
    const snap = await service.getStoreStatsSnapshot(STORE_ID);
    expect(snap.categoryCounts).toEqual([]);
  });
});
