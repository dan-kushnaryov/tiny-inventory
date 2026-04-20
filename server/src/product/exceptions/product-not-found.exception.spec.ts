import { describe, expect, it } from 'vitest';
import { ProductNotFoundException } from './product-not-found.exception';

describe('ProductNotFoundException', () => {
  it('has stable code and message', () => {
    const e = new ProductNotFoundException('pid');
    expect(e.code).toBe('PRODUCT_NOT_FOUND');
    expect(e.productId).toBe('pid');
    expect(e.message).toContain('pid');
  });
});
