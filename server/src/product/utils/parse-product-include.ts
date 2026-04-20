import { BadRequestException } from '@nestjs/common';

/** Allowed `include` tokens for the owning store relation (JSON:API-style). */
const STORE_ALIASES = new Set(['store', 'stores']);

export type ParsedProductInclude = {
  /** TypeORM relation paths to load */
  relations: string[];
  /** When true, API omits `storeId` and returns nested `store`. */
  embedStore: boolean;
};

/**
 * `true` when `value` is absent, empty/whitespace-only, or only allowed
 * comma-separated tokens (`store` / `stores`).
 */
export function isProductIncludeList(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value !== 'string') {
    return false;
  }
  if (value.trim() === '') {
    return true;
  }
  const tokens = value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) {
    return false;
  }
  return tokens.every((t) => STORE_ALIASES.has(t.toLowerCase()));
}

/**
 * Parses JSON:API-style `include` query (comma-separated).
 * `store` and `stores` both mean the owning store resource.
 */
export function parseProductInclude(
  include?: string | null,
): ParsedProductInclude {
  if (include == null || include.trim() === '') {
    return { relations: [], embedStore: false };
  }
  if (!isProductIncludeList(include)) {
    throw new BadRequestException(
      'Invalid include. Allowed: comma-separated store (alias: stores).',
    );
  }
  const tokens = include
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const wantsStore = tokens.some((t) => STORE_ALIASES.has(t.toLowerCase()));
  return {
    relations: wantsStore ? ['store'] : [],
    embedStore: wantsStore,
  };
}
