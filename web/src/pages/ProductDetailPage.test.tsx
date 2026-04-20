import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProductDetailPage } from './ProductDetailPage';
import { fetchProduct } from '../api/products';
import { fetchCategories } from '../api/categories';
import { fetchStores } from '../api/stores';

vi.mock('../api/products', () => ({
  fetchProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

vi.mock('../api/categories', () => ({
  fetchCategories: vi.fn(),
}));

vi.mock('../api/stores', () => ({
  fetchStores: vi.fn(),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <TooltipProvider delayDuration={0}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/products/product-1']}>
          <Routes>
            <Route path="/products/:id" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </TooltipProvider>,
  );
}

describe('ProductDetailPage', () => {
  it('keeps decimal price input and integer-only stock input', async () => {
    vi.mocked(fetchProduct).mockResolvedValueOnce({
      id: 'product-1',
      name: 'MacBook',
      categoryId: 'cat-1',
      category: 'Laptops',
      price: 1299,
      quantityInStock: 7,
      storeId: 'store-1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
    vi.mocked(fetchCategories).mockResolvedValueOnce([
      {
        id: 'cat-1',
        name: 'Laptops',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]);
    vi.mocked(fetchStores).mockResolvedValueOnce({
      items: [
        {
          id: 'store-1',
          name: 'Main store',
          address: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });

    renderPage();

    const priceInput = (await screen.findByLabelText('Price')) as HTMLInputElement;
    const stockInput = (await screen.findByLabelText('Stock')) as HTMLInputElement;

    fireEvent.change(priceInput, { target: { value: '--12,30++' } });
    fireEvent.change(stockInput, { target: { value: '9e2' } });

    expect(priceInput).toHaveValue('12.30');
    expect(stockInput).toHaveValue('92');
  });
});
