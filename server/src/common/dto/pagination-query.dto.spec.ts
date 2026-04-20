import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { PaginationQueryDto } from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  it('accepts valid page and limit', async () => {
    const dto = plainToInstance(PaginationQueryDto, { page: 2, limit: 50 });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects page below 1', async () => {
    const dto = plainToInstance(PaginationQueryDto, { page: 0 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });

  it('rejects limit above 100', async () => {
    const dto = plainToInstance(PaginationQueryDto, { limit: 101 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });
});
