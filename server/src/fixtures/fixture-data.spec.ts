import { describe, expect, it } from 'vitest';
import { FIXTURE_STORES, buildFixtureProductSeeds } from './fixture-data';

describe('fixture-data', () => {
  it('FIXTURE_STORES has expected length', () => {
    expect(FIXTURE_STORES.length).toBe(6);
  });

  it('buildFixtureProductSeeds returns empty when no store ids', () => {
    expect(buildFixtureProductSeeds([])).toEqual([]);
  });

  it('buildFixtureProductSeeds returns products for first store only when one id', () => {
    const ids = ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'] as const;
    const products = buildFixtureProductSeeds(ids);
    expect(products.length).toBeGreaterThan(0);
    expect(products.every((p) => p.storeId === ids[0])).toBe(true);
  });

  it('buildFixtureProductSeeds scales with six store ids', () => {
    const ids = Array.from(
      { length: 6 },
      (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
    );
    const products = buildFixtureProductSeeds(ids);
    expect(products.length).toBeGreaterThan(
      buildFixtureProductSeeds([ids[0]]).length,
    );
  });
});
