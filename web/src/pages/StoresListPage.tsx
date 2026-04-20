import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreateStoreModal } from '../components/CreateStoreModal';
import { fetchStores } from '../api/stores';

export function StoresListPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const [createOpen, setCreateOpen] = useState(false);

  const q = useQuery({
    queryKey: ['stores', page, limit],
    queryFn: () => fetchStores(page, limit),
  });

  return (
    <div className="page">
      <CreateStoreModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Stores</h1>
          <p className="muted">
            List and open a store for details, stats, and edits.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          New store
        </button>
      </div>

      {q.isLoading && (
        <div className="row">
          <div className="spinner" aria-label="Loading" />
          <span className="muted">Loading stores…</span>
        </div>
      )}
      {q.isError && <div className="error">{(q.error as Error).message}</div>}

      {q.data && (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {q.data.items.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/stores/${s.id}`}>{s.name}</Link>
                    </td>
                    <td className="muted">{s.address ?? '—'}</td>
                    <td>
                      <Link
                        to={`/stores/${s.id}/stats`}
                        className="icon-link"
                        aria-label={`View stats for ${s.name}`}
                        title="View stats"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M4 20h16" />
                          <rect x="6" y="11" width="3" height="7" rx="0.8" />
                          <rect x="11" y="8" width="3" height="10" rx="0.8" />
                          <rect x="16" y="5" width="3" height="13" rx="0.8" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row muted">
            <span>
              Page {q.data.meta.page} of {q.data.meta.totalPages} ({q.data.meta.total}{' '}
              stores)
            </span>
            <div className="row">
              <button
                type="button"
                className="btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn"
                disabled={page >= q.data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
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
