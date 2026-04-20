import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StoresListPage } from './StoresListPage';
import { renderWithProviders } from '../test/renderWithProviders';
import { fetchStores } from '../api/stores';

vi.mock('../api/stores', () => ({
  fetchStores: vi.fn(),
  createStore: vi.fn(),
}));

describe('StoresListPage', () => {
  it('renders an accessible stats icon link for each store row', async () => {
    vi.mocked(fetchStores).mockResolvedValueOnce({
      items: [
        {
          id: 'store-1',
          name: 'Downtown',
          address: 'Main st',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    renderWithProviders(<StoresListPage />);

    const statsLink = await screen.findByRole('link', {
      name: /view stats for downtown/i,
    });

    expect(statsLink).toHaveAttribute('href', '/stores/store-1/stats');
  });
});
