import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchCategories } from '../api/categories';
import { FieldValidationTooltip } from '../components/ui/FieldValidationTooltip';
import { deleteProduct, fetchProduct, updateProduct } from '../api/products';
import { fetchStores } from '../api/stores';
import { ProductNameInput } from '../components/ProductNameInput';
import {
  clampProductNameRawInput,
  parsedPrice,
  parsedStock,
  priceInputError,
  productNameLengthError,
  sanitizeStockDraft,
  stockInputError,
} from '../utils/productFieldErrors';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [storeId, setStoreId] = useState('');
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);

  const q = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!, true),
    enabled: Boolean(id),
  });

  const storesQ = useQuery({
    queryKey: ['stores', 1, 100],
    queryFn: () => fetchStores(1, 100),
  });

  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (q.data) {
      setName(clampProductNameRawInput(q.data.name));
      setCategoryId(q.data.categoryId);
      setPrice(String(q.data.price));
      setStock(String(q.data.quantityInStock));
      setStoreId(q.data.storeId ?? q.data.store?.id ?? '');
      setAttemptedSave(false);
    }
  }, [q.data]);

  useEffect(() => {
    setSaveSuccessOpen(false);
  }, [id]);

  useEffect(() => {
    if (!saveSuccessOpen) {
      return;
    }
    const timer = window.setTimeout(() => setSaveSuccessOpen(false), 5000);
    return () => window.clearTimeout(timer);
  }, [saveSuccessOpen]);

  const nameTrim = name.trim();
  const priceErr = priceInputError(price);
  const stockErr = stockInputError(stock);
  const nameLenErr = productNameLengthError(nameTrim);
  const nameReqErr = attemptedSave && !nameTrim ? 'Name is required.' : null;
  const nameFieldErr = nameLenErr ?? nameReqErr;
  const categoryReqErr =
    attemptedSave && !categoryId ? 'Select a category.' : null;
  const priceOk = parsedPrice(price);
  const stockOk = parsedStock(stock);
  const priceReqErr = attemptedSave && priceOk == null && !priceErr ? 'Price is required.' : null;
  const stockReqErr =
    attemptedSave && stockOk == null && !stockErr ? 'Stock is required.' : null;

  const canSave =
    Boolean(nameTrim) &&
    !nameLenErr &&
    Boolean(categoryId) &&
    Boolean(storeId) &&
    priceOk != null &&
    stockOk != null;

  const saveMut = useMutation({
    mutationFn: () =>
      updateProduct(id!, {
        name: nameTrim,
        categoryId,
        price: priceOk!,
        quantityInStock: stockOk!,
        storeId: storeId.trim() || undefined,
      }),
    onMutate: () => {
      setSaveSuccessOpen(false);
    },
    onSuccess: () => {
      setAttemptedSave(false);
      setSaveSuccessOpen(true);
      void qc.invalidateQueries({ queryKey: ['product', id] });
      void qc.invalidateQueries({ queryKey: ['products'] });
      void qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const delMut = useMutation({
    mutationFn: () => deleteProduct(id!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] });
      void navigate('/products');
    },
  });

  if (!id) {
    return <div className="page error">Missing product id.</div>;
  }

  return (
    <div className="page">
      <p className="muted">
        <Link to="/products">← Products</Link>
      </p>
      <h1>Product</h1>

      {q.isLoading && (
        <div className="row">
          <div className="spinner" aria-label="Loading" />
          <span className="muted">Loading…</span>
        </div>
      )}
      {q.isError && <div className="error">{(q.error as Error).message}</div>}

      {q.data && (
        <div className="card stack">
          {saveSuccessOpen && (
            <div
              className="alert alert-success"
              role="alert"
              aria-live="polite"
            >
              <span>Changes saved successfully.</span>
              <button
                type="button"
                className="alert-dismiss"
                aria-label="Dismiss notification"
                onClick={() => setSaveSuccessOpen(false)}
              >
                ×
              </button>
            </div>
          )}
          {(saveMut.isError || delMut.isError) && (
            <div className="alert alert-danger" role="alert" aria-live="assertive">
              <span>{((saveMut.error ?? delMut.error) as Error).message}</span>
              <button
                type="button"
                className="alert-dismiss"
                aria-label="Dismiss error"
                onClick={() => {
                  saveMut.reset();
                  delMut.reset();
                }}
              >
                ×
              </button>
            </div>
          )}
          <div className="muted">ID: {q.data.id}</div>
          {q.data.store && (
            <p className="muted">
              Store:{' '}
              <Link to={`/stores/${q.data.store.id}`}>{q.data.store.name}</Link>
            </p>
          )}
          <ProductNameInput
            id="p-name"
            value={name}
            onChange={setName}
            errorMessage={nameFieldErr}
          />
          <div className="stack">
            <label htmlFor="p-cat">Category</label>
            <FieldValidationTooltip message={categoryReqErr}>
              <select
                id="p-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={categoriesQ.isLoading}
                aria-invalid={Boolean(categoryReqErr)}
              >
                <option value="">Select category…</option>
                {categoriesQ.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FieldValidationTooltip>
          </div>
          <div className="row" style={{ gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className="stack" style={{ flex: '1 1 8rem' }}>
              <label htmlFor="p-price">Price</label>
              <FieldValidationTooltip message={priceErr ?? priceReqErr}>
                <input
                  id="p-price"
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(sanitizeStockDraft(e.target.value))}
                  aria-invalid={Boolean(priceErr || priceReqErr)}
                />
              </FieldValidationTooltip>
            </div>
            <div className="stack" style={{ flex: '1 1 8rem' }}>
              <label htmlFor="p-stock">Stock</label>
              <FieldValidationTooltip message={stockErr ?? stockReqErr}>
                <input
                  id="p-stock"
                  type="text"
                  inputMode="numeric"
                  value={stock}
                  onChange={(e) => setStock(sanitizeStockDraft(e.target.value))}
                  aria-invalid={Boolean(stockErr || stockReqErr)}
                />
              </FieldValidationTooltip>
            </div>
          </div>
          <div className="stack">
            <label htmlFor="p-store">Store</label>
            <select
              id="p-store"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              disabled={storesQ.isLoading}
            >
              {storesQ.data?.items.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={saveMut.isPending}
              onClick={() => {
                setAttemptedSave(true);
                if (!canSave) {
                  return;
                }
                saveMut.mutate();
              }}
            >
              {saveMut.isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={delMut.isPending}
              onClick={() => {
                if (window.confirm('Delete this product?')) {
                  delMut.mutate();
                }
              }}
            >
              {delMut.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
