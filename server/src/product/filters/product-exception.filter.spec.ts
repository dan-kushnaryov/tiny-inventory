import { describe, expect, it, vi } from 'vitest';
import { StoreNotFoundException } from '../../store/exceptions/store-not-found.exception';
import { ProductNotFoundException } from '../exceptions/product-not-found.exception';
import { ProductExceptionFilter } from './product-exception.filter';

describe('ProductExceptionFilter', () => {
  const filter = new ProductExceptionFilter();

  it('handles ProductNotFoundException', () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    };

    filter.catch(new ProductNotFoundException('pid'), host as never);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'PRODUCT_NOT_FOUND' }),
    );
  });

  it('handles StoreNotFoundException', () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    };

    filter.catch(new StoreNotFoundException('sid'), host as never);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'STORE_NOT_FOUND' }),
    );
  });
});
