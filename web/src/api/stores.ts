import { apiFetch } from './http';
import { ApiRoute, StoreSubPath, apiPath } from './routes';
import type { PaginatedStores, Store, StoreStats } from './types';

export function fetchStores(page = 1, limit = 20) {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch<PaginatedStores>(`${apiPath(ApiRoute.Stores)}?${q.toString()}`);
}

export function fetchStore(id: string) {
  return apiFetch<Store>(apiPath(ApiRoute.Stores, id));
}

export function fetchStoreStats(id: string) {
  return apiFetch<StoreStats>(apiPath(ApiRoute.Stores, id, StoreSubPath.Stats));
}

export function createStore(body: { name: string; address?: string | null }) {
  return apiFetch<Store>(apiPath(ApiRoute.Stores), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateStore(
  id: string,
  body: { name?: string; address?: string | null },
) {
  return apiFetch<Store>(apiPath(ApiRoute.Stores, id), {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteStore(id: string) {
  return apiFetch<void>(apiPath(ApiRoute.Stores, id), { method: 'DELETE' });
}
