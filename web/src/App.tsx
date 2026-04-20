import { TooltipProvider } from '@radix-ui/react-tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';

const pageNames = [
  'StoresListPage',
  'StoreProductsPage',
  'StoreStatsPage',
  'StoreDetailPage',
  'ProductsListPage',
  'ProductDetailPage',
] as const;

type PageName = (typeof pageNames)[number];

const pageLoaders = import.meta.glob('./pages/*Page.tsx');

function createLazyPage(
  name: PageName,
): LazyExoticComponent<ComponentType> {
  return lazy(async () => {
    const path = `./pages/${name}.tsx`;
    const loader = pageLoaders[path];
    if (!loader) {
      throw new Error(`Missing page module "${path}".`);
    }
    const module = (await loader()) as Record<string, ComponentType>;
    const component = module[name];
    if (!component) {
      throw new Error(`Missing page export "${name}" in lazy module.`);
    }
    return { default: component };
  });
}

const pages = Object.fromEntries(
  pageNames.map((name) => [name, createLazyPage(name)]),
) as Record<PageName, LazyExoticComponent<ComponentType>>;

const {
  StoresListPage,
  StoreProductsPage,
  StoreStatsPage,
  StoreDetailPage,
  ProductsListPage,
  ProductDetailPage,
} = pages;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/stores" replace /> },
      { path: 'stores', element: <StoresListPage /> },
      { path: 'stores/:id/products', element: <StoreProductsPage /> },
      { path: 'stores/:id/stats', element: <StoreStatsPage /> },
      { path: 'stores/:id', element: <StoreDetailPage /> },
      { path: 'products', element: <ProductsListPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
    ],
  },
]);

export default function App() {
  return (
    <TooltipProvider delayDuration={400}>
      <QueryClientProvider client={queryClient}>
        <Suspense
          fallback={
            <div className="page">
              <div className="row">
                <div className="spinner" aria-label="Loading" />
                <span className="muted">Loading screen…</span>
              </div>
            </div>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
      </QueryClientProvider>
    </TooltipProvider>
  );
}
