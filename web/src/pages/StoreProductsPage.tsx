import { Link, useParams } from 'react-router-dom';
import { ProductsListPage } from './ProductsListPage';

export function StoreProductsPage() {
  const { id } = useParams<{ id: string }>();

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
      <ProductsListPage fixedStoreId={id} />
    </div>
  );
}
