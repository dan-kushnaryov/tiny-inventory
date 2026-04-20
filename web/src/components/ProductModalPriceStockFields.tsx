import {
  PRODUCT_PRICE_MAX,
  PRODUCT_QUANTITY_STOCK_MAX,
  sanitizePriceDraft,
  sanitizeStockDraft,
} from '../utils/productFieldErrors';
import { FieldValidationTooltip } from './ui/FieldValidationTooltip';

const priceMaxLabel = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
}).format(PRODUCT_PRICE_MAX);

const stockMaxLabel = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
}).format(PRODUCT_QUANTITY_STOCK_MAX);

export type ProductModalPriceStockFieldsProps = {
  price: string;
  onPriceChange: (value: string) => void;
  priceError: string | null;
  stock: string;
  onStockChange: (value: string) => void;
  stockError: string | null;
};

/**
 * Price + stock row for the New product modal: text inputs (better decimal UX than
 * type=number), sanitised typing, and compact limits like the name counter row.
 */
export function ProductModalPriceStockFields({
  price,
  onPriceChange,
  priceError,
  stock,
  onStockChange,
  stockError,
}: ProductModalPriceStockFieldsProps) {
  const priceHintId = 'modal-product-price-hint';
  const stockHintId = 'modal-product-stock-hint';

  return (
    <div className="row" style={{ gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div className="stack" style={{ flex: '1 1 7rem' }}>
        <div
          className="row"
          style={{
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <label htmlFor="modal-product-price">Price (USD)</label>
          <span id={priceHintId} className="field-hint">
            Max {priceMaxLabel} · 2 decimals
          </span>
        </div>
        <FieldValidationTooltip message={priceError}>
          <input
            id="modal-product-price"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={price}
            onChange={(e) => onPriceChange(sanitizePriceDraft(e.target.value))}
            aria-invalid={Boolean(priceError)}
            aria-describedby={priceHintId}
          />
        </FieldValidationTooltip>
      </div>
      <div className="stack" style={{ flex: '1 1 7rem' }}>
        <div
          className="row"
          style={{
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <label htmlFor="modal-product-stock">Stock (units)</label>
          <span id={stockHintId} className="field-hint">
            Max {stockMaxLabel} · whole number
          </span>
        </div>
        <FieldValidationTooltip message={stockError}>
          <input
            id="modal-product-stock"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            value={stock}
            onChange={(e) => onStockChange(sanitizeStockDraft(e.target.value))}
            aria-invalid={Boolean(stockError)}
            aria-describedby={stockHintId}
          />
        </FieldValidationTooltip>
      </div>
    </div>
  );
}
