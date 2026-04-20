import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { ProductQueryDto } from './product-query.dto';

describe('ProductQueryDto', () => {
  it('accepts valid include list', async () => {
    const dto = plainToInstance(ProductQueryDto, { include: 'store,stores' });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects invalid include', async () => {
    const dto = plainToInstance(ProductQueryDto, { include: 'unknown' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('normalizes empty categoryId to valid optional', async () => {
    const dto = plainToInstance(ProductQueryDto, { categoryId: '   ' });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects non-uuid categoryId', async () => {
    const dto = plainToInstance(ProductQueryDto, { categoryId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
