import { describe, expect, it } from 'vitest';
import { resolvePagination, toPaginatedResult } from './pagination';

describe('resolvePagination', () => {
  it('uses defaults when page and limit are omitted', () => {
    expect(resolvePagination({})).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it('clamps page to at least 1', () => {
    expect(resolvePagination({ page: 0 })).toMatchObject({ page: 1 });
    expect(resolvePagination({ page: -5 })).toMatchObject({ page: 1 });
  });

  it('clamps limit between 1 and 100', () => {
    expect(resolvePagination({ limit: 0 })).toMatchObject({ limit: 1 });
    expect(resolvePagination({ limit: 500 })).toMatchObject({ limit: 100 });
  });

  it('computes skip from page and limit', () => {
    expect(resolvePagination({ page: 3, limit: 10 })).toEqual({
      page: 3,
      limit: 10,
      skip: 20,
    });
  });
});

describe('toPaginatedResult', () => {
  it('builds meta with totalPages', () => {
    const r = toPaginatedResult(['a'], 25, 2, 10);
    expect(r.items).toEqual(['a']);
    expect(r.meta).toEqual({
      total: 25,
      page: 2,
      limit: 10,
      totalPages: 3,
    });
  });

  it('returns zero totalPages when limit is 0', () => {
    const r = toPaginatedResult([], 0, 1, 0);
    expect(r.meta.totalPages).toBe(0);
  });
});
