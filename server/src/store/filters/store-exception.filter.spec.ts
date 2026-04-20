import { describe, expect, it, vi } from 'vitest';
import { StoreExceptionFilter } from './store-exception.filter';
import { StoreNotFoundException } from '../exceptions/store-not-found.exception';

describe('StoreExceptionFilter', () => {
  it('writes 404 JSON with domain code', () => {
    const filter = new StoreExceptionFilter();
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    };

    filter.catch(
      new StoreNotFoundException('00000000-0000-4000-8000-000000000099'),
      host as never,
    );

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        code: 'STORE_NOT_FOUND',
        error: 'Not Found',
      }),
    );
  });
});
