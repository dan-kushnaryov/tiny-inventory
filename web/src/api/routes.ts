/** Nest @Controller path segments — keep in sync with server controllers. */
export enum ApiRoute {
  Categories = 'categories',
  Products = 'products',
  Stores = 'stores',
}

/** Paths under /stores/:storeId/… */
export enum StoreSubPath {
  Stats = 'stats',
}

/** Build an API path, e.g. apiPath(ApiRoute.Stores, id) → /stores/:id */
export function apiPath(...parts: Array<string | number>): string {
  return `/${parts.map(String).join('/')}`;
}
