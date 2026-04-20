import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  children: ReactNode;
  /** Footer row (e.g. cancel + submit). Omit for header-only close. */
  footer?: ReactNode;
};

/**
 * Accessible modal: overlay click + Escape close, `role="dialog"`, `aria-modal`.
 * Renders into `document.body` via a portal.
 */
export function Modal({
  open,
  onClose,
  title,
  titleId = 'modal-title',
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id={titleId} className="modal-title">
            {title}
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer != null && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

export type ModalActionsProps = {
  onCancel: () => void;
  cancelLabel?: string;
  children: ReactNode;
};

/** Right-aligned row: Cancel + custom actions (e.g. primary submit). */
export function ModalActions({
  onCancel,
  cancelLabel = 'Cancel',
  children,
}: ModalActionsProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
      <button type="button" className="btn" onClick={onCancel}>
        {cancelLabel}
      </button>
      {children}
    </div>
  );
}
