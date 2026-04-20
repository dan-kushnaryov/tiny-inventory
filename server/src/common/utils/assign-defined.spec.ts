import { describe, expect, it } from 'vitest';
import { assignDefined, pickDefined } from './assign-defined';

describe('assignDefined', () => {
  it('copies defined and null values, skips undefined', () => {
    const target: Record<string, unknown> = { a: 1 };
    assignDefined(target, { b: 2, c: undefined, d: null });
    expect(target).toEqual({ a: 1, b: 2, d: null });
    expect('c' in target).toBe(false);
  });
});

describe('pickDefined', () => {
  it('drops keys whose value is undefined', () => {
    expect(pickDefined({ a: 1, b: undefined, c: null })).toEqual({
      a: 1,
      c: null,
    });
  });
});
