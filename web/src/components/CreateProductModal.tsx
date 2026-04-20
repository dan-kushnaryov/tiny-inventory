import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { fetchCategories } from '../api/categories';
import { createProduct } from '../api/products';
import { fetchStores } from '../api/stores';
import {
  parsedPrice,
  parsedStock,
  priceInputError,
  productNameLengthError,
  stockInputError,
} from '../utils/productFieldErrors';
import { ProductModalPriceStockFields } from './ProductModalPriceStockFields';
import { ProductNameInput } from './ProductNameInput';
import { FieldValidationTooltip } from './ui/FieldValidationTooltip';
import { Modal, ModalActions } from './ui/Modal';

export type CreateProductModalProps = {
  open: boolean;
  onClose: () => void;
  /** Pre-select and lock store (e.g. from `/stores/:id/products`). */
  fixedStoreId?: string;
};

export function CreateProductModal({
  open,
  onClose,
  fixedStoreId,
}: CreateProductModalProps) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [storeId, setStoreId] = useState(fixedStoreId ?? '');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [createSuccessOpen, setCreateSuccessOpen] = useState(false);

  const handleClose = useCallback(() => {
    setCreateSuccessOpen(false);
    onClose();
  }, [onClose]);

  const storesQ = useQuery({
    queryKey: ['stores', 1, 100],
    queryFn: () => fetchStores(1, 100),
    enabled: open,
  });

  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: open,
  });

  useEffect(() => {
    if (!open) {
      setName('');
      setCategoryId('');
      setPrice('');
      setStock('');
      setStoreId(fixedStoreId ?? '');
      setAttemptedSubmit(false);
      setCreateSuccessOpen(false);
      return;
    }
    setAttemptedSubmit(false);
    setCreateSuccessOpen(false);
    if (fixedStoreId) {
      setStoreId(fixedStoreId);
    }
  }, [open, fixedStoreId]);

  useEffect(() => {
    if (!open || !createSuccessOpen) {
      return;
    }
    const timer = window.setTimeout(() => {
      handleClose();
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [open, createSuccessOpen, handleClose]);

  const nameTrim = name.trim();
  const priceTrim = price.trim();
  const stockTrim = stock.trim();
  const priceErr = priceInputError(price);
  const stockErr = stockInputError(stock);
  const nameLenErr = productNameLengthError(nameTrim);
  const nameReqErr = attemptedSubmit && !nameTrim ? 'Name is required.' : null;
  const nameFieldErr = nameLenErr ?? nameReqErr;
  const categoryReqErr =
    attemptedSubmit && !categoryId ? 'Select a category.' : null;
  const storeReqErr = attemptedSubmit && !storeId ? 'Select a store.' : null;
  const priceReqErr =
    attemptedSubmit && !priceTrim ? 'Price is required.' : null;
  const stockReqErr =
    attemptedSubmit && !stockTrim ? 'Stock is required.' : null;

  const priceOk = parsedPrice(price);
  const stockOk = parsedStock(stock);

  const createMut = useMutation({
    mutationFn: () =>
      createProduct({
        name: nameTrim,
        categoryId,
        price: priceOk!,
        quantityInStock: stockOk!,
        storeId,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] });
      void qc.invalidateQueries({ queryKey: ['categories'] });
      setCreateSuccessOpen(true);
    },
  });

  const canSubmit =
    Boolean(nameTrim) &&
    !nameLenErr &&
    Boolean(categoryId) &&
    Boolean(storeId) &&
    priceOk != null &&
    stockOk != null;

  const formId = 'create-product-form';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New product"
      footer={
        <ModalActions onCancel={handleClose}>
          <button
            type="submit"
            form={formId}
            className="btn btn-primary"
            disabled={createMut.isPending || createSuccessOpen}
          >
            {createMut.isPending ? 'Saving…' : 'Create'}
          </button>
        </ModalActions>
      }
    >
      <form
        id={formId}
        className="stack"
        style={{ gap: '0.75rem' }}
        onSubmit={(e) => {
          e.preventDefault();
          if (createSuccessOpen) {
            return;
          }
          setAttemptedSubmit(true);
          if (!canSubmit) {
            return;
          }
          createMut.mutate();
        }}
      >
        {createSuccessOpen && (
          <div
            className="alert alert-success"
            role="alert"
            aria-live="polite"
          >
            <span>Product created successfully.</span>
            <button
              type="button"
              className="alert-dismiss"
              aria-label="Dismiss and close"
              onClick={handleClose}
            >
              ×
            </button>
          </div>
        )}
        {createMut.isError && (
          <div className="alert alert-danger" role="alert" aria-live="assertive">
            <span>{(createMut.error as Error).message}</span>
            <button
              type="button"
              className="alert-dismiss"
              aria-label="Dismiss error"
              onClick={() => createMut.reset()}
            >
              ×
            </button>
          </div>
        )}
        <fieldset
          disabled={createMut.isPending || createSuccessOpen}
          style={{
            border: 'none',
            padding: 0,
            margin: 0,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
        <ProductNameInput
          id="modal-product-name"
          value={name}
          onChange={setName}
          errorMessage={nameFieldErr}
          autoFocus
        />
        <div className="stack">
          <label htmlFor="modal-product-category">Category</label>
          <FieldValidationTooltip message={categoryReqErr}>
            <select
              id="modal-product-category"
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
        <ProductModalPriceStockFields
          price={price}
          onPriceChange={setPrice}
          priceError={priceErr ?? priceReqErr}
          stock={stock}
          onStockChange={setStock}
          stockError={stockErr ?? stockReqErr}
        />
        <div className="stack">
          <label htmlFor="modal-product-store">Store</label>
          <FieldValidationTooltip message={storeReqErr}>
            <select
              id="modal-product-store"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              disabled={storesQ.isLoading || Boolean(fixedStoreId)}
              aria-invalid={Boolean(storeReqErr)}
            >
              <option value="">Select store…</option>
              {storesQ.data?.items.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FieldValidationTooltip>
        </div>
        </fieldset>
      </form>
    </Modal>
  );
}
