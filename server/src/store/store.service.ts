import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import type { PaginatedResult } from '../common/types/paginated-result';
import { pickDefined } from '../common/utils/assign-defined';
import {
  resolvePagination,
  toPaginatedResult,
} from '../common/utils/pagination';
import { Product } from '../product/entities/product.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Store } from './entities/store.entity';
import { StoreNotFoundException } from './exceptions/store-not-found.exception';
import type { StoreStatsSnapshot } from './types/store-stats-snapshot.type';

const LOW_STOCK_THRESHOLD = 5;

/**
 * One round-trip: single scan of the store’s products (PG12+ `MATERIALIZED` CTE).
 */
const STORE_STATS_SNAPSHOT_SQL = `
WITH filtered AS MATERIALIZED (
  SELECT
    p.price,
    p.quantity_in_stock,
    c.name AS category
  FROM products p
  INNER JOIN categories c ON c.id = p.category_id
  WHERE p.store_id = $1
),
summary AS (
  SELECT
    COALESCE(SUM(price * quantity_in_stock), 0) AS total_value,
    COUNT(*)::bigint AS total_products,
    COUNT(*) FILTER (WHERE quantity_in_stock < $2)::bigint AS low_stock_count
  FROM filtered
)
SELECT
  s.total_value,
  s.total_products,
  s.low_stock_count,
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'category', x.category,
          'productCount', x.product_count
        )
        ORDER BY x.product_count DESC, x.category ASC
      )
      FROM (
        SELECT category, COUNT(*)::int AS product_count
        FROM filtered
        GROUP BY category
      ) x
    ),
    '[]'::json
  ) AS category_rows
FROM summary s
`.trim();

type StoreStatsSqlRow = {
  total_value: string | number;
  total_products: string | number;
  low_stock_count: string | number;
  category_rows: unknown;
};

type CategoryAggJson = { category: string; productCount: number };

function categoryFromJsonField(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
}

function coerceStatsRow(row: unknown): StoreStatsSqlRow | undefined {
  if (row == null || typeof row !== 'object') {
    return undefined;
  }
  const o = row as Record<string, unknown>;
  return {
    total_value: o.total_value as string | number,
    total_products: o.total_products as string | number,
    low_stock_count: o.low_stock_count as string | number,
    category_rows: o.category_rows,
  };
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function parseNumericRaw(raw: string | number | null | undefined): number {
  if (raw == null) {
    return 0;
  }
  if (typeof raw === 'number') {
    return raw;
  }
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function parseIntRaw(raw: string | number | null | undefined): number {
  if (raw == null) {
    return 0;
  }
  if (typeof raw === 'number') {
    return Math.trunc(raw);
  }
  const n = Number.parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : 0;
}

function parseCategoryRowsJson(raw: unknown): CategoryAggJson[] {
  if (raw == null) {
    return [];
  }
  let parsed: unknown;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      return [];
    }
  } else {
    parsed = raw;
  }
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.map((item) => {
    const row = item as { category?: unknown; productCount?: unknown };
    return {
      category: categoryFromJsonField(row.category),
      productCount: parseIntRaw(
        row.productCount as string | number | null | undefined,
      ),
    };
  });
}

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(dto: CreateStoreDto): Promise<Store> {
    const store = this.storeRepository.create({
      name: dto.name,
      address: dto.address ?? null,
    });
    return this.storeRepository.save(store);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Store>> {
    const { page, limit, skip } = resolvePagination(query);
    const [items, total] = await this.storeRepository.findAndCount({
      order: { name: 'ASC' },
      skip,
      take: limit,
    });
    return toPaginatedResult(items, total, page, limit);
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new StoreNotFoundException(id);
    }
    return store;
  }

  async update(id: string, dto: UpdateStoreDto): Promise<Store> {
    const patch = pickDefined(dto as unknown as Record<string, unknown>);
    if (Object.keys(patch).length === 0) {
      return this.findOne(id);
    }
    const result = await this.storeRepository.update(id, {
      ...patch,
      updatedAt: new Date(),
    });
    if (result.affected === 0) {
      throw new StoreNotFoundException(id);
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.storeRepository.delete(id);
    if (result.affected === 0) {
      throw new StoreNotFoundException(id);
    }
  }

  /**
   * Aggregated “inventory health” inputs for a store (raw numbers; HTTP DTO
   * is built in the controller).
   */
  async getStoreStatsSnapshot(storeId: string): Promise<StoreStatsSnapshot> {
    await this.findOne(storeId);

    const rawResult: unknown = await this.productRepository.query(
      STORE_STATS_SNAPSHOT_SQL,
      [storeId, LOW_STOCK_THRESHOLD],
    );
    const summary = Array.isArray(rawResult)
      ? coerceStatsRow(rawResult[0])
      : undefined;
    if (summary == null) {
      return {
        storeId,
        totalInventoryValue: 0,
        totalProducts: 0,
        lowStockProductCount: 0,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
        categoryCounts: [],
      };
    }
    const totalProducts = parseIntRaw(summary.total_products);
    const lowStockProductCount = parseIntRaw(summary.low_stock_count);
    const totalInventoryValue = round2(parseNumericRaw(summary.total_value));

    const categoryCounts = parseCategoryRowsJson(summary.category_rows);

    return {
      storeId,
      totalInventoryValue,
      totalProducts,
      lowStockProductCount,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      categoryCounts,
    };
  }
}
