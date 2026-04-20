import { describe, expect, it } from 'vitest';
import { IsProductIncludeListConstraint } from './is-product-include.constraint';

describe('IsProductIncludeListConstraint', () => {
  const c = new IsProductIncludeListConstraint();

  it('validate mirrors isProductIncludeList', () => {
    expect(c.validate('store')).toBe(true);
    expect(c.validate('bad')).toBe(false);
  });

  it('defaultMessage returns guidance string', () => {
    expect(c.defaultMessage()).toContain('include');
  });
});
