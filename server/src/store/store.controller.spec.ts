import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';

const SID = '00000000-0000-4000-8000-000000000001';

describe('StoreController', () => {
  let controller: StoreController;
  const storeService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    getStoreStatsSnapshot: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [{ provide: StoreService, useValue: storeService }],
    }).compile();
    controller = module.get(StoreController);
  });

  it('create maps to DTO', async () => {
    const now = new Date();
    const store = {
      id: SID,
      name: 'N',
      address: null,
      createdAt: now,
      updatedAt: now,
      products: [],
    };
    storeService.create.mockResolvedValue(store);
    const dto = await controller.create({ name: 'N', address: null });
    expect(dto.id).toBe(SID);
    expect(dto.name).toBe('N');
  });

  it('findAll maps pagination', async () => {
    storeService.findAll.mockResolvedValue({
      items: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    });
    const out = await controller.findAll({});
    expect(out.meta.total).toBe(0);
  });

  it('getStats maps snapshot', async () => {
    storeService.getStoreStatsSnapshot.mockResolvedValue({
      storeId: SID,
      totalInventoryValue: 0,
      totalProducts: 0,
      lowStockProductCount: 0,
      lowStockThreshold: 5,
      categoryCounts: [],
    });
    const dto = await controller.getStats(SID);
    expect(dto.storeId).toBe(SID);
  });

  it('remove delegates to service', async () => {
    storeService.remove.mockResolvedValue(undefined);
    await controller.remove(SID);
    expect(storeService.remove).toHaveBeenCalledWith(SID);
  });

  it('findOne maps store', async () => {
    const now = new Date();
    const store = {
      id: SID,
      name: 'N',
      address: null,
      createdAt: now,
      updatedAt: now,
      products: [],
    };
    storeService.findOne.mockResolvedValue(store);
    const dto = await controller.findOne(SID);
    expect(dto.name).toBe('N');
  });

  it('update maps store', async () => {
    const now = new Date();
    const store = {
      id: SID,
      name: 'N2',
      address: null,
      createdAt: now,
      updatedAt: now,
      products: [],
    };
    storeService.update.mockResolvedValue(store);
    const dto = await controller.update(SID, { name: 'N2' });
    expect(dto.name).toBe('N2');
  });
});
