import {
  StoreCategoryDistributionItemDto,
  StoreStatsResponseDto,
  StoreStockStatusDto,
} from '../dto/store-stats.response.dto';
import type { StoreStatsSnapshot } from '../types/store-stats-snapshot.type';

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function toStoreStatsResponseDto(
  snapshot: StoreStatsSnapshot,
): StoreStatsResponseDto {
  const stockStatus = new StoreStockStatusDto();
  stockStatus.lowStockThreshold = snapshot.lowStockThreshold;
  stockStatus.productsBelowThreshold = snapshot.lowStockProductCount;
  stockStatus.totalProducts = snapshot.totalProducts;
  stockStatus.lowStockPercent =
    snapshot.totalProducts === 0
      ? 0
      : round2((snapshot.lowStockProductCount / snapshot.totalProducts) * 100);

  const categoryDistribution = snapshot.categoryCounts.map((row) => {
    const item = new StoreCategoryDistributionItemDto();
    item.category = row.category;
    item.productCount = row.productCount;
    item.percentOfProducts =
      snapshot.totalProducts === 0
        ? 0
        : round2((row.productCount / snapshot.totalProducts) * 100);
    return item;
  });

  const dto = new StoreStatsResponseDto();
  dto.storeId = snapshot.storeId;
  dto.totalInventoryValue = snapshot.totalInventoryValue;
  dto.stockStatus = stockStatus;
  dto.categoryDistribution = categoryDistribution;
  return dto;
}
