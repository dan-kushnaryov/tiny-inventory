import { apiFetch } from './http';
import { ApiRoute, apiPath } from './routes';
import type { Category } from './types';

export function fetchCategories() {
  return apiFetch<Category[]>(apiPath(ApiRoute.Categories));
}
