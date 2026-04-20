import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { ProductIncludeQueryDto } from './product-include-query.dto';

describe('ProductIncludeQueryDto', () => {
  it('accepts store include', async () => {
    const dto = plainToInstance(ProductIncludeQueryDto, { include: 'store' });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects bad include', async () => {
    const dto = plainToInstance(ProductIncludeQueryDto, { include: 'x' });
    expect((await validate(dto)).length).toBeGreaterThan(0);
  });
});
