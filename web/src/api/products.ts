import { apiFetch } from './http';
import { ApiRoute, apiPath } from './routes';
import type { PaginatedProducts, Product } from './types';

export type ProductListParams = {
  page?: number;
  limit?: number;
  storeId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  include?: string;
};

function appendQueryParams(
  q: URLSearchParams,
  params: Record<string, string | number | undefined>,
) {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    q.set(key, String(value));
  }
}

export function fetchProducts(params: ProductListParams = {}) {
  const q = new URLSearchParams();
  appendQueryParams(q, params);
  const qs = q.toString();
  return apiFetch<PaginatedProducts>(
    `${apiPath(ApiRoute.Products)}${qs ? `?${qs}` : ''}`,
  );
}

export function fetchProduct(id: string, includeStore = false) {
  const q = includeStore ? '?include=store' : '';
  return apiFetch<Product>(`${apiPath(ApiRoute.Products, id)}${q}`);
}

export function createProduct(body: {
  name: string;
  categoryId: string;
  price: number;
  quantityInStock: number;
  storeId: string;
}) {
  return apiFetch<Product>(apiPath(ApiRoute.Products), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateProduct(
  id: string,
  body: Partial<{
    name: string;
    categoryId: string;
    price: number;
    quantityInStock: number;
    storeId: string;
  }>,
) {
  return apiFetch<Product>(apiPath(ApiRoute.Products, id), {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteProduct(id: string) {
  return apiFetch<void>(apiPath(ApiRoute.Products, id), { method: 'DELETE' });
}
