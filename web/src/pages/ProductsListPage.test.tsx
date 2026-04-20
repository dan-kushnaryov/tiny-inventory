import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductsListPage } from './ProductsListPage';
import { renderWithProviders } from '../test/renderWithProviders';
import { fetchProducts } from '../api/products';
import { fetchCategories } from '../api/categories';

vi.mock('../api/products', () => ({
  fetchProducts: vi.fn(),
  createProduct: vi.fn(),
}));

vi.mock('../api/categories', () => ({
  fetchCategories: vi.fn(),
}));

vi.mock('../api/stores', () => ({
  fetchStores: vi.fn(),
}));

describe('ProductsListPage', () => {
  it('shows stock range validation for invalid bounds', async () => {
    vi.mocked(fetchCategories).mockResolvedValueOnce([]);
    vi.mocked(fetchProducts).mockResolvedValue({
      items: [
        {
          id: 'product-1',
          name: 'iPhone',
          categoryId: 'cat-1',
          category: 'Phones',
          price: 10,
          quantityInStock: 5,
          storeId: 'store-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    const { container } = renderWithProviders(<ProductsListPage fixedStoreId="store-1" />);

    const minStock = container.querySelector('#filter-min-stock') as HTMLInputElement | null;
    expect(minStock).not.toBeNull();

    const maxStock = container.querySelector('#filter-max-stock') as HTMLInputElement | null;
    expect(maxStock).not.toBeNull();

    fireEvent.change(minStock!, { target: { value: '10' } });
    fireEvent.change(maxStock!, { target: { value: '2' } });

    expect(
      screen.getAllByText('Stock: upper bound must be greater than or equal to lower bound.')
        .length,
    ).toBeGreaterThan(0);

    await waitFor(() => {
      expect(vi.mocked(fetchProducts)).toHaveBeenCalledWith(
        expect.objectContaining({
          storeId: 'store-1',
          minStock: 10,
        }),
      );
    });
  });
});
