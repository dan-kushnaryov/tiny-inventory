export type StoreCategoryCountSnapshot = {
  category: string;
  productCount: number;
};

/** Plain aggregate result from persistence (no HTTP response shape). */
export type StoreStatsSnapshot = {
  storeId: string;
  totalInventoryValue: number;
  totalProducts: number;
  lowStockProductCount: number;
  lowStockThreshold: number;
  categoryCounts: StoreCategoryCountSnapshot[];
};
