import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import {
  isProductIncludeList,
  parseProductInclude,
} from './parse-product-include';

describe('isProductIncludeList', () => {
  it('allows undefined, null, empty string', () => {
    expect(isProductIncludeList(undefined)).toBe(true);
    expect(isProductIncludeList(null)).toBe(true);
    expect(isProductIncludeList('')).toBe(true);
    expect(isProductIncludeList('  ')).toBe(true);
  });

  it('rejects non-string', () => {
    expect(isProductIncludeList(1)).toBe(false);
  });

  it('allows store and stores tokens case-insensitively', () => {
    expect(isProductIncludeList('store')).toBe(true);
    expect(isProductIncludeList('STORE, stores')).toBe(true);
  });

  it('rejects unknown tokens', () => {
    expect(isProductIncludeList('foo')).toBe(false);
    expect(isProductIncludeList('store,extra')).toBe(false);
  });
});

describe('parseProductInclude', () => {
  it('returns empty relations when absent', () => {
    expect(parseProductInclude(undefined)).toEqual({
      relations: [],
      embedStore: false,
    });
    expect(parseProductInclude('')).toEqual({
      relations: [],
      embedStore: false,
    });
  });

  it('parses store include', () => {
    expect(parseProductInclude('store')).toEqual({
      relations: ['store'],
      embedStore: true,
    });
  });

  it('throws BadRequest on invalid include', () => {
    expect(() => parseProductInclude('invalid')).toThrow(BadRequestException);
  });
});
