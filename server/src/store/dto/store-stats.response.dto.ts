/** Share of product SKUs (rows) in this category for the store. */
export class StoreCategoryDistributionItemDto {
  category!: string;
  productCount!: number;
  /** Percent of all products in the store (0–100, two decimal places). */
  percentOfProducts!: number;
}

export class StoreStockStatusDto {
  /** Units below this count are treated as low stock (per SKU). */
  lowStockThreshold!: number;
  /** Number of product SKUs with `quantityInStock` strictly below the threshold. */
  productsBelowThreshold!: number;
  totalProducts!: number;
  /** Percent of SKUs that are low stock (0 if there are no products). */
  lowStockPercent!: number;
}

export class StoreStatsResponseDto {
  storeId!: string;
  /** Sum of price × quantity for all products in the store. */
  totalInventoryValue!: number;
  stockStatus!: StoreStockStatusDto;
  categoryDistribution!: StoreCategoryDistributionItemDto[];
}
