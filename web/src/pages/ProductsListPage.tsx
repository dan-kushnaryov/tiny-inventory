import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../api/categories';
import { fetchProducts } from '../api/products';
import { formatUsd } from '../utils/formatUsd';
import {
  sanitizePriceDraft,
  sanitizeStockDraft,
} from '../utils/productFieldErrors';
import { fetchStores } from '../api/stores';
import { CreateProductModal } from '../components/CreateProductModal';
import { FieldValidationTooltip } from '../components/ui/FieldValidationTooltip';

function optionalNonNegativeFloat(raw: string): number | undefined {
  const t = raw.trim();
  if (t === '') return undefined;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function optionalNonNegativeInt(raw: string): number | undefined {
  const t = raw.trim();
  if (t === '') return undefined;
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

const FILTER_FIELD_STACK_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'stretch',
  /** Let flex items shrink past number-input min-content (1 digit vs 2+ digits changes intrinsic width). */
  minWidth: 0,
};

export type ProductsListPageProps = {
  /** When set, list is scoped to this store (same as `?storeId=` on `/products`). */
  fixedStoreId?: string;
};

export function ProductsListPage({ fixedStoreId }: ProductsListPageProps = {}) {
  const [page, setPage] = useState(1);
  const limit = 20;
  const [storeId, setStoreId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minPriceStr, setMinPriceStr] = useState('');
  const [maxPriceStr, setMaxPriceStr] = useState('');
  const [minStockStr, setMinStockStr] = useState('');
  const [maxStockStr, setMaxStockStr] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const minPrice = optionalNonNegativeFloat(minPriceStr);
  const maxPrice = optionalNonNegativeFloat(maxPriceStr);
  const minStock = optionalNonNegativeInt(minStockStr);
  const maxStock = optionalNonNegativeInt(maxStockStr);

  const priceRangeInvalid =
    minPrice != null && maxPrice != null && maxPrice < minPrice;
  const stockRangeInvalid =
    minStock != null && maxStock != null && maxStock < minStock;

  const filters = useMemo(
    () => ({
      page,
      limit,
      storeId: fixedStoreId ?? (storeId || undefined),
      categoryId: categoryId || undefined,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
    }),
    [
      page,
      limit,
      fixedStoreId,
      storeId,
      categoryId,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
    ],
  );

  const storesQ = useQuery({
    queryKey: ['stores', 1, 100],
    queryFn: () => fetchStores(1, 100),
    enabled: !fixedStoreId,
  });

  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
  });

  const q = useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    enabled: !priceRangeInvalid && !stockRangeInvalid,
    /** Avoid unmounting the table on every filter keystroke (new cache entry has no data until fetch completes). */
    placeholderData: keepPreviousData,
  });

  return (
    <div className={fixedStoreId ? undefined : 'page'}>
      <CreateProductModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        fixedStoreId={fixedStoreId}
      />

      <div
        className="row"
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>
            {fixedStoreId ? 'Products in this store' : 'Products'}
          </h1>
          <p className="muted">
            {fixedStoreId ? (
              <>
                Products scoped to this store. <Link to="/products">Browse all products</Link>
              </>
            ) : (
              'Filter the catalog, open a product, or add a new one.'
            )}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          New product
        </button>
      </div>

      <div className="card stack">
        <h2 style={{ marginTop: 0 }}>Filters</h2>
        <div
          className="row"
          style={{ flexWrap: 'wrap', alignItems: 'stretch', minWidth: 0 }}
        >
          {!fixedStoreId && (
            <div className="stack" style={{ ...FILTER_FIELD_STACK_STYLE, flex: '1 1 14rem' }}>
              <label htmlFor="filter-store">Store</label>
              <select
                id="filter-store"
                value={storeId}
                onChange={(e) => {
                  setStoreId(e.target.value);
                  setPage(1);
                }}
                disabled={storesQ.isLoading}
              >
                <option value="">All stores</option>
                {storesQ.data?.items.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {fixedStoreId && (
            <div
              className="stack"
              style={{ ...FILTER_FIELD_STACK_STYLE, flex: '1 1 12rem' }}
            >
              <p className="muted" style={{ margin: 0 }}>
                Store filter: <code style={{ color: '#c8c8d8' }}>{fixedStoreId}</code>
              </p>
            </div>
          )}
          <div className="stack" style={{ ...FILTER_FIELD_STACK_STYLE, flex: '1 1 12rem' }}>
            <label htmlFor="filter-category">Category</label>
            <FieldValidationTooltip
              message={
                categoriesQ.isError ? (categoriesQ.error as Error).message : null
              }
            >
              <span style={{ display: 'block', width: '100%' }}>
                <select
                  id="filter-category"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setPage(1);
                  }}
                  disabled={categoriesQ.isLoading}
                  aria-invalid={categoriesQ.isError}
                >
                  <option value="">All categories</option>
                  {(categoriesQ.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </span>
            </FieldValidationTooltip>
          </div>
          <div className="stack" style={{ ...FILTER_FIELD_STACK_STYLE, flex: '1 1 10rem' }}>
            <label htmlFor="filter-min-price" style={{ display: 'block' }}>
              Price (USD)
            </label>
            <FieldValidationTooltip
              message={
                priceRangeInvalid
                  ? 'Price: upper bound must be greater than or equal to lower bound.'
                  : null
              }
            >
              <div
                className="row"
                style={{
                  gap: '0.5rem',
                  flexWrap: 'nowrap',
                  width: '100%',
                  minWidth: 0,
                }}
                aria-invalid={priceRangeInvalid}
              >
                <input
                  id="filter-min-price"
                  type="number"
                  min={0}
                  step={0.01}
                  inputMode="decimal"
                  placeholder="Min"
                  value={minPriceStr}
                  onChange={(e) => {
                    setMinPriceStr(sanitizePriceDraft(e.target.value));
                    setPage(1);
                  }}
                  style={{ width: '100%', minWidth: 0 }}
                />
                <input
                  id="filter-max-price"
                  type="number"
                  min={0}
                  step={0.01}
                  inputMode="decimal"
                  placeholder="Max"
                  value={maxPriceStr}
                  onChange={(e) => {
                    setMaxPriceStr(sanitizePriceDraft(e.target.value));
                    setPage(1);
                  }}
                  style={{ width: '100%', minWidth: 0 }}
                />
              </div>
            </FieldValidationTooltip>
          </div>
          <div className="stack" style={{ ...FILTER_FIELD_STACK_STYLE, flex: '1 1 10rem' }}>
            <label htmlFor="filter-min-stock" style={{ display: 'block' }}>
              Stock (units)
            </label>
            <FieldValidationTooltip
              message={
                stockRangeInvalid
                  ? 'Stock: upper bound must be greater than or equal to lower bound.'
                  : null
              }
            >
              <div
                className="row"
                style={{
                  gap: '0.5rem',
                  flexWrap: 'nowrap',
                  width: '100%',
                  minWidth: 0,
                }}
                aria-invalid={stockRangeInvalid}
              >
                <input
                  id="filter-min-stock"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  placeholder="Min"
                  value={minStockStr}
                  onChange={(e) => {
                    setMinStockStr(sanitizeStockDraft(e.target.value));
                    setPage(1);
                  }}
                  style={{ width: '100%', minWidth: 0 }}
                />
                <input
                  id="filter-max-stock"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  placeholder="Max"
                  value={maxStockStr}
                  onChange={(e) => {
                    setMaxStockStr(sanitizeStockDraft(e.target.value));
                    setPage(1);
                  }}
                  style={{ width: '100%', minWidth: 0 }}
                />
              </div>
            </FieldValidationTooltip>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: 'stretch',
              flex: '0 0 auto',
            }}
          >
            <div style={{ flex: 1, minHeight: 0 }} />
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (!fixedStoreId) {
                  setStoreId('');
                }
                setCategoryId('');
                setMinPriceStr('');
                setMaxPriceStr('');
                setMinStockStr('');
                setMaxStockStr('');
                setPage(1);
              }}
            >
              Reset filters
            </button>
          </div>
        </div>
      </div>

      {q.isLoading && (
        <div className="row">
          <div className="spinner" aria-label="Loading" />
          <span className="muted">Loading products…</span>
        </div>
      )}
      {q.isError && <div className="error">{(q.error as Error).message}</div>}

      {!priceRangeInvalid && !stockRangeInvalid && q.data && (
        <>
          <div
            className="card"
            style={{
              padding: 0,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <table className="products-list-table">
              <colgroup>
                <col style={{ width: '30%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '26%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Store</th>
                </tr>
              </thead>
              <tbody>
                {q.data.items.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/products/${p.id}`}>{p.name}</Link>
                    </td>
                    <td>{p.category}</td>
                    <td>{formatUsd(p.price)}</td>
                    <td>{p.quantityInStock}</td>
                    <td className="muted">
                      {p.storeId ? (
                        <Link to={`/stores/${p.storeId}`}>{p.storeId.slice(0, 8)}…</Link>
                      ) : (
                        p.store?.name ?? '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row muted">
            <span>
              Page {q.data.meta.page} of {q.data.meta.totalPages} ({q.data.meta.total}{' '}
              products)
            </span>
            <div className="row">
              <button
                type="button"
                className="btn"
                disabled={page <= 1}
                onClick={() => setPage((x) => Math.max(1, x - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn"
                disabled={page >= q.data.meta.totalPages}
                onClick={() => setPage((x) => x + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
