import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchStoreStats } from '../api/stores';
import { formatUsd } from '../utils/formatUsd';

export function StoreStatsPage() {
  const { id } = useParams<{ id: string }>();

  const q = useQuery({
    queryKey: ['store-stats', id],
    queryFn: () => fetchStoreStats(id!),
    enabled: Boolean(id),
  });

  if (!id) {
    return <div className="page error">Missing store id.</div>;
  }

  return (
    <div className="page">
      <p className="muted">
        <Link to="/stores">← Stores</Link>
        {' · '}
        <Link to={`/stores/${id}`}>Store detail</Link>
      </p>
      <h1>Store inventory stats</h1>

      {q.isLoading && (
        <div className="row">
          <div className="spinner" aria-label="Loading" />
          <span className="muted">Loading stats…</span>
        </div>
      )}
      {q.isError && <div className="error">{(q.error as Error).message}</div>}

      {q.data && (
        <div
          className="stack"
          style={{
            gap: '1rem',
            width: '100%',
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 15rem), 1fr))',
              gap: '1rem',
              alignItems: 'stretch',
            }}
          >
            <div
              className="card"
              style={{
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                minWidth: 0,
              }}
            >
              <div className="muted">Total inventory value</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 }}>
                {formatUsd(q.data.totalInventoryValue)}
              </div>
            </div>
            <div
              className="card"
              style={{
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                minWidth: 0,
              }}
            >
              <div className="muted">Products</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 }}>
                {q.data.stockStatus.totalProducts}
              </div>
              <div className="muted" style={{ marginTop: '0.35rem' }}>
                Below low-stock threshold ({q.data.stockStatus.lowStockThreshold}):{' '}
                <strong>{q.data.stockStatus.productsBelowThreshold}</strong> (
                {q.data.stockStatus.lowStockPercent}%)
              </div>
            </div>
          </div>

          <div className="card" style={{ margin: 0 }}>
            <h2 style={{ marginTop: 0 }}>By category</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Share of products per category (bar length = count).
            </p>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={q.data.categoryDistribution}
                  layout="vertical"
                  margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" />
                  <XAxis type="number" stroke="#9898a8" tick={{ fill: '#9898a8' }} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={100}
                    stroke="#9898a8"
                    tick={{ fill: '#c8c8d8', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#181822',
                      border: '1px solid #35354a',
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: '#e8e8ef' }}
                  />
                  <Bar dataKey="productCount" fill="#5b8bd9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            className="card"
            style={{ margin: 0, padding: 0, overflow: 'hidden' }}
          >
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Count</th>
                  <th>% of products</th>
                </tr>
              </thead>
              <tbody>
                {q.data.categoryDistribution.map((row) => (
                  <tr key={row.category}>
                    <td>{row.category}</td>
                    <td>{row.productCount}</td>
                    <td>{row.percentOfProducts}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
