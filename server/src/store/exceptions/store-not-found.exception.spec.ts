import { describe, expect, it } from 'vitest';
import { StoreNotFoundException } from './store-not-found.exception';

describe('StoreNotFoundException', () => {
  it('has stable code and message', () => {
    const e = new StoreNotFoundException('abc');
    expect(e.code).toBe('STORE_NOT_FOUND');
    expect(e.storeId).toBe('abc');
    expect(e.message).toContain('abc');
  });
});
