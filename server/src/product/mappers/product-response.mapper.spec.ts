import { describe, expect, it } from 'vitest';
import type { Category } from '../../category/entities/category.entity';
import type { Product } from '../entities/product.entity';
import type { Store } from '../../store/entities/store.entity';
import {
  toPaginatedProductsResponse,
  toProductResponseDto,
} from './product-response.mapper';

function mockProduct(overrides: Partial<Product> = {}): Product {
  const now = new Date('2026-01-01T00:00:00.000Z');
  const category = {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'C',
  } as Category;
  return {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'P',
    category,
    price: '12.50',
    quantityInStock: 3,
    storeId: '00000000-0000-4000-8000-000000000001',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as Product;
}

describe('toProductResponseDto', () => {
  it('embeds storeId when embedStore is false', () => {
    const dto = toProductResponseDto(mockProduct(), false);
    expect(dto.storeId).toBe('00000000-0000-4000-8000-000000000001');
    expect(dto.store).toBeUndefined();
    expect(dto.categoryId).toBe('11111111-1111-4111-8111-111111111111');
    expect(dto.category).toBe('C');
    expect(dto.price).toBe(12.5);
  });

  it('embeds store when embedStore is true', () => {
    const store = {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Shop',
      address: null,
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Store;
    const dto = toProductResponseDto(mockProduct({ store }), true);
    expect(dto.store?.name).toBe('Shop');
    expect(dto.storeId).toBeUndefined();
  });

  it('throws when embedStore but store not loaded', () => {
    expect(() => toProductResponseDto(mockProduct(), true)).toThrow(
      'Product.store must be loaded',
    );
  });
});

describe('toPaginatedProductsResponse', () => {
  it('maps each item with embed flag', () => {
    const out = toPaginatedProductsResponse(
      {
        items: [mockProduct()],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      },
      false,
    );
    expect(out.items[0].storeId).toBeDefined();
  });
});
