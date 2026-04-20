import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateProductDto } from './create-product.dto';

const SID = '00000000-0000-4000-8000-000000000001';

describe('CreateProductDto', () => {
  it('accepts valid payload', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'N',
      categoryId: '11111111-1111-4111-8111-111111111111',
      price: 9.99,
      quantityInStock: 2,
      storeId: SID,
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects negative price', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'N',
      categoryId: '11111111-1111-4111-8111-111111111111',
      price: -1,
      quantityInStock: 0,
      storeId: SID,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'price')).toBe(true);
  });

  it('rejects quantity above product cap', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'N',
      categoryId: '11111111-1111-4111-8111-111111111111',
      price: 1,
      quantityInStock: 1_000_000,
      storeId: SID,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'quantityInStock')).toBe(true);
  });

  it('rejects price above product cap', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'N',
      categoryId: '11111111-1111-4111-8111-111111111111',
      price: 1_000_000,
      quantityInStock: 0,
      storeId: SID,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'price')).toBe(true);
  });
});
