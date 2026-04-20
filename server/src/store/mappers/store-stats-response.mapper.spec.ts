import { describe, expect, it } from 'vitest';
import type { StoreStatsSnapshot } from '../types/store-stats-snapshot.type';
import { toStoreStatsResponseDto } from './store-stats-response.mapper';

function snapshot(
  overrides: Partial<StoreStatsSnapshot> = {},
): StoreStatsSnapshot {
  return {
    storeId: '00000000-0000-4000-8000-000000000001',
    totalInventoryValue: 100,
    totalProducts: 10,
    lowStockProductCount: 2,
    lowStockThreshold: 5,
    categoryCounts: [{ category: 'Grocery', productCount: 6 }],
    ...overrides,
  };
}

describe('toStoreStatsResponseDto', () => {
  it('maps snapshot to DTO with percents', () => {
    const dto = toStoreStatsResponseDto(snapshot());
    expect(dto.storeId).toBe(snapshot().storeId);
    expect(dto.totalInventoryValue).toBe(100);
    expect(dto.stockStatus.lowStockPercent).toBe(20);
    expect(dto.categoryDistribution[0].percentOfProducts).toBe(60);
  });

  it('uses zero percents when there are no products', () => {
    const dto = toStoreStatsResponseDto(
      snapshot({
        totalProducts: 0,
        lowStockProductCount: 0,
        categoryCounts: [],
      }),
    );
    expect(dto.stockStatus.lowStockPercent).toBe(0);
    expect(dto.stockStatus.totalProducts).toBe(0);
    expect(dto.categoryDistribution).toEqual([]);
  });
});
