import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteStore, fetchStore, updateStore } from '../api/stores';
import { ProductNameInput } from '../components/ProductNameInput';
import { StoreAddressInput } from '../components/StoreAddressInput';
import {
  clampProductNameRawInput,
  productNameLengthError,
} from '../utils/productFieldErrors';
import {
  sanitizeAddressDraft,
  storeAddressLengthError,
} from '../utils/storeFieldErrors';

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);

  const q = useQuery({
    queryKey: ['store', id],
    queryFn: () => fetchStore(id!),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (q.data) {
      setName(clampProductNameRawInput(q.data.name));
      setAddress(sanitizeAddressDraft(q.data.address ?? ''));
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
  const addressTrim = address.trim();
  const nameLenErr = productNameLengthError(nameTrim);
  const nameReqErr =
    attemptedSave && !nameTrim ? 'Store name is required.' : null;
  const nameFieldErr = nameLenErr ?? nameReqErr;
  const addressLenErr = storeAddressLengthError(addressTrim);

  const canSave = Boolean(nameTrim) && !nameLenErr && !addressLenErr;

  const saveMut = useMutation({
    mutationFn: () =>
      updateStore(id!, {
        name: nameTrim,
        address: addressTrim === '' ? null : addressTrim,
      }),
    onMutate: () => {
      setSaveSuccessOpen(false);
    },
    onSuccess: () => {
      setAttemptedSave(false);
      setSaveSuccessOpen(true);
      void qc.invalidateQueries({ queryKey: ['store', id] });
      void qc.invalidateQueries({ queryKey: ['stores'] });
    },
  });

  const delMut = useMutation({
    mutationFn: () => deleteStore(id!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['stores'] });
      void navigate('/stores');
    },
  });

  if (!id) {
    return <div className="page error">Missing store id.</div>;
  }

  return (
    <div className="page">
      <p className="muted">
        <Link to="/stores">← Stores</Link>
      </p>
      <h1>Store</h1>

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
          <div
            className="row"
            style={{
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <span className="muted">ID: {q.data.id}</span>
            <div className="row" style={{ gap: '0.5rem' }}>
              <Link className="btn" to={`/stores/${id}/products`}>
                View products
              </Link>
              <Link className="btn" to={`/stores/${id}/stats`}>
                View stats
              </Link>
            </div>
          </div>
          <ProductNameInput
            id="store-edit-name"
            value={name}
            onChange={setName}
            errorMessage={nameFieldErr}
            label="Store name"
            placeholder="Store name"
          />
          <StoreAddressInput
            id="store-edit-address"
            value={address}
            onChange={setAddress}
            errorMessage={addressLenErr}
          />
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
                if (window.confirm('Delete this store and its products?')) {
                  delMut.mutate();
                }
              }}
            >
              {delMut.isPending ? 'Deleting…' : 'Delete store'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
