import { describe, expect, it } from 'vitest';
import type { Store } from '../entities/store.entity';
import {
  toPaginatedStoresResponse,
  toStoreResponseDto,
} from './store-response.mapper';

function mockStore(overrides: Partial<Store> = {}): Store {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'S',
    address: 'A',
    products: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as Store;
}

describe('toStoreResponseDto', () => {
  it('maps entity fields', () => {
    const dto = toStoreResponseDto(mockStore());
    expect(dto.id).toBe('00000000-0000-4000-8000-000000000001');
    expect(dto.name).toBe('S');
    expect(dto.address).toBe('A');
  });
});

describe('toPaginatedStoresResponse', () => {
  it('maps items and meta', () => {
    const out = toPaginatedStoresResponse({
      items: [mockStore({ name: 'One' })],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });
    expect(out.items).toHaveLength(1);
    expect(out.items[0].name).toBe('One');
    expect(out.meta.total).toBe(1);
  });
});
