export type PaginatedMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Store = {
  id: string;
  name: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedStores = {
  items: Store[];
  meta: PaginatedMeta;
};

/** Row from `GET /categories`. */
export type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  price: number;
  quantityInStock: number;
  createdAt: string;
  updatedAt: string;
  storeId?: string;
  store?: Store;
};

export type PaginatedProducts = {
  items: Product[];
  meta: PaginatedMeta;
};

export type StoreStats = {
  storeId: string;
  totalInventoryValue: number;
  stockStatus: {
    lowStockThreshold: number;
    productsBelowThreshold: number;
    totalProducts: number;
    lowStockPercent: number;
  };
  categoryDistribution: {
    category: string;
    productCount: number;
    percentOfProducts: number;
  }[];
};

export type ApiErrorBody = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  code?: string;
};
