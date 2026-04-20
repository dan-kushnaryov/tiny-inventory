import type { CreateStoreDto } from '../store/dto/create-store.dto';

/** One product row for fixtures; `categoryName` is resolved to `categoryId` when seeding. */
export type FixtureProductSeed = {
  name: string;
  categoryName: string;
  price: number;
  quantityInStock: number;
  storeId: string;
};

export const FIXTURE_STORES: readonly CreateStoreDto[] = [
  { name: 'Downtown Mini Market', address: '12 Market Square' },
  { name: 'Harbor Supply Co.', address: '42 Pier Road' },
  { name: 'Uptown Express Mart', address: '88 Cedar Lane' },
  { name: 'Campus Corner Shop', address: null },
  { name: 'Riverside Hardware', address: '5 River Walk' },
  { name: 'Airport News & Gifts', address: 'Terminal 2, Gate D14' },
];

function product(
  storeId: string,
  row: Omit<FixtureProductSeed, 'storeId'>,
): FixtureProductSeed {
  return { ...row, storeId };
}

/** Builds products for however many stores were created (same order as `FIXTURE_STORES`). */
export function buildFixtureProductSeeds(
  storeIds: readonly string[],
): readonly FixtureProductSeed[] {
  const [a, b, c, d, e, f] = storeIds;
  if (!a) {
    return [];
  }
  const out: FixtureProductSeed[] = [];

  const add = (
    id: string | undefined,
    rows: Omit<FixtureProductSeed, 'storeId'>[],
  ) => {
    if (!id) return;
    for (const row of rows) {
      out.push(product(id, row));
    }
  };

  add(a, [
    {
      name: 'Paper napkins',
      categoryName: 'Household',
      price: 2.49,
      quantityInStock: 120,
    },
    {
      name: 'LED desk lamp',
      categoryName: 'Electronics',
      price: 34.99,
      quantityInStock: 18,
    },
    {
      name: 'Organic oats 1kg',
      categoryName: 'Grocery',
      price: 5.5,
      quantityInStock: 64,
    },
    {
      name: 'Dish soap 750ml',
      categoryName: 'Household',
      price: 3.25,
      quantityInStock: 90,
    },
    {
      name: 'AA batteries (8-pack)',
      categoryName: 'Electronics',
      price: 6.99,
      quantityInStock: 55,
    },
    {
      name: 'Whole milk 2L',
      categoryName: 'Grocery',
      price: 2.89,
      quantityInStock: 40,
    },
  ]);

  add(b, [
    {
      name: 'Work gloves (pair)',
      categoryName: 'Hardware',
      price: 8.25,
      quantityInStock: 200,
    },
    {
      name: 'Extension cord 5m',
      categoryName: 'Electronics',
      price: 16.0,
      quantityInStock: 40,
    },
    {
      name: 'First-aid kit',
      categoryName: 'Health',
      price: 22.75,
      quantityInStock: 30,
    },
    {
      name: 'Duct tape 25m',
      categoryName: 'Hardware',
      price: 9.5,
      quantityInStock: 75,
    },
    {
      name: 'Safety goggles',
      categoryName: 'Hardware',
      price: 12.4,
      quantityInStock: 45,
    },
    {
      name: 'N95 masks (10-pack)',
      categoryName: 'Health',
      price: 14.99,
      quantityInStock: 100,
    },
  ]);

  add(c, [
    {
      name: 'Energy drink 500ml',
      categoryName: 'Grocery',
      price: 2.29,
      quantityInStock: 200,
    },
    {
      name: 'Protein bar',
      categoryName: 'Grocery',
      price: 1.99,
      quantityInStock: 150,
    },
    {
      name: 'Phone charger USB-C',
      categoryName: 'Electronics',
      price: 18.5,
      quantityInStock: 35,
    },
    {
      name: 'Travel umbrella',
      categoryName: 'Household',
      price: 15.0,
      quantityInStock: 28,
    },
    {
      name: 'Bottled water 6-pack',
      categoryName: 'Grocery',
      price: 4.49,
      quantityInStock: 80,
    },
  ]);

  add(d, [
    {
      name: 'Notebook A5 ruled',
      categoryName: 'Stationery',
      price: 3.75,
      quantityInStock: 110,
    },
    {
      name: 'Ballpoint pens (5)',
      categoryName: 'Stationery',
      price: 2.1,
      quantityInStock: 200,
    },
    {
      name: 'Sticky notes 3x3',
      categoryName: 'Stationery',
      price: 4.2,
      quantityInStock: 95,
    },
    {
      name: 'Highlighter set',
      categoryName: 'Stationery',
      price: 5.95,
      quantityInStock: 60,
    },
    {
      name: 'USB flash drive 32GB',
      categoryName: 'Electronics',
      price: 11.99,
      quantityInStock: 42,
    },
  ]);

  add(e, [
    {
      name: 'Claw hammer 16oz',
      categoryName: 'Hardware',
      price: 19.99,
      quantityInStock: 22,
    },
    {
      name: 'Screwdriver set 6pc',
      categoryName: 'Hardware',
      price: 24.5,
      quantityInStock: 18,
    },
    {
      name: 'Measuring tape 5m',
      categoryName: 'Hardware',
      price: 7.8,
      quantityInStock: 50,
    },
    {
      name: 'Sandpaper assorted',
      categoryName: 'Hardware',
      price: 6.25,
      quantityInStock: 70,
    },
    {
      name: 'Wood glue 250ml',
      categoryName: 'Hardware',
      price: 5.6,
      quantityInStock: 36,
    },
    {
      name: 'Paint brush 2-inch',
      categoryName: 'Hardware',
      price: 4.4,
      quantityInStock: 48,
    },
  ]);

  add(f, [
    {
      name: 'Travel pillow',
      categoryName: 'Travel',
      price: 17.99,
      quantityInStock: 25,
    },
    {
      name: 'Neck wallet passport holder',
      categoryName: 'Travel',
      price: 12.5,
      quantityInStock: 40,
    },
    {
      name: 'Magazine (assorted)',
      categoryName: 'Media',
      price: 6.99,
      quantityInStock: 120,
    },
    {
      name: 'Snickers bar',
      categoryName: 'Grocery',
      price: 1.49,
      quantityInStock: 300,
    },
    {
      name: 'Chewing gum pack',
      categoryName: 'Grocery',
      price: 1.25,
      quantityInStock: 250,
    },
    {
      name: 'Sunglasses budget',
      categoryName: 'Accessories',
      price: 9.99,
      quantityInStock: 55,
    },
  ]);

  return out;
}
