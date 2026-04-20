import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { createStore } from '../api/stores';
import { productNameLengthError } from '../utils/productFieldErrors';
import { storeAddressLengthError } from '../utils/storeFieldErrors';
import { ProductNameInput } from './ProductNameInput';
import { StoreAddressInput } from './StoreAddressInput';
import { Modal, ModalActions } from './ui/Modal';

export type CreateStoreModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateStoreModal({ open, onClose }: CreateStoreModalProps) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [createSuccessOpen, setCreateSuccessOpen] = useState(false);

  const handleClose = useCallback(() => {
    setCreateSuccessOpen(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      setName('');
      setAddress('');
      setAttemptedSubmit(false);
      setCreateSuccessOpen(false);
      return;
    }
    setAttemptedSubmit(false);
    setCreateSuccessOpen(false);
  }, [open]);

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
  const addressTrim = address.trim();
  const nameLenErr = productNameLengthError(nameTrim);
  const nameReqErr = attemptedSubmit && !nameTrim ? 'Store name is required.' : null;
  const nameFieldErr = nameLenErr ?? nameReqErr;
  const addressLenErr = storeAddressLengthError(addressTrim);

  const canSubmit = Boolean(nameTrim) && !nameLenErr && !addressLenErr;

  const createMut = useMutation({
    mutationFn: () =>
      createStore({
        name: nameTrim,
        address: addressTrim === '' ? null : addressTrim,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['stores'] });
      setCreateSuccessOpen(true);
    },
  });

  const formId = 'create-store-form';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New store"
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
            <span>Store created successfully.</span>
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
            id="modal-store-name"
            value={name}
            onChange={setName}
            errorMessage={nameFieldErr}
            autoFocus
            label="Store name"
            placeholder="Store name"
          />
          <StoreAddressInput
            id="modal-store-address"
            value={address}
            onChange={setAddress}
            errorMessage={addressLenErr}
          />
        </fieldset>
      </form>
    </Modal>
  );
}
