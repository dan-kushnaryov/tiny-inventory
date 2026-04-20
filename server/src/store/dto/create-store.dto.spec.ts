import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateStoreDto } from './create-store.dto';

describe('CreateStoreDto', () => {
  it('accepts name and null address', async () => {
    const dto = plainToInstance(CreateStoreDto, {
      name: 'Shop',
      address: null,
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects empty name', async () => {
    const dto = plainToInstance(CreateStoreDto, { name: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
