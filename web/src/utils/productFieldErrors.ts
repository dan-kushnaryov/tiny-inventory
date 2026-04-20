import { stripControlChars } from './sanitizeText';

/** Matches `CreateProductDto` `@MaxLength` and DB `varchar(255)`. */
export const PRODUCT_NAME_MAX_LENGTH = 255;

/** Same as server `CreateProductDto` — sensible max unit price (USD). */
export const PRODUCT_PRICE_MAX = 999_999.99;

/** Same as server `CreateProductDto` — sensible max units in stock. */
export const PRODUCT_QUANTITY_STOCK_MAX = 999_999;

/** Hard cap on raw input length (after sanitize) to avoid huge pastes freezing the UI. */
export const PRODUCT_NAME_MAX_INPUT_CHARS = 400;

/** Strip control chars; line breaks become spaces (product titles are single-line). */
export function sanitizeProductNameInput(raw: string): string {
  return stripControlChars(raw)
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/\t/g, ' ');
}

export function clampProductNameRawInput(raw: string): string {
  return sanitizeProductNameInput(raw).slice(0, PRODUCT_NAME_MAX_INPUT_CHARS);
}

export function productNameLengthError(trimmedName: string): string | null {
  if (trimmedName.length > PRODUCT_NAME_MAX_LENGTH) {
    return `Name must be at most ${PRODUCT_NAME_MAX_LENGTH} characters (after trimming spaces).`;
  }
  return null;
}

const PRICE_DRAFT_MAX_CHARS = 22;
const STOCK_DRAFT_MAX_CHARS = 12;

/** Allow only digits and one dot; cap length while typing (API still validates). */
export function sanitizePriceDraft(raw: string): string {
  let s = raw.replace(/[^\d.,]/g, '').replace(/,/g, '.');
  const i = s.indexOf('.');
  if (i !== -1) {
    s =
      s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '');
  }
  return s.slice(0, PRICE_DRAFT_MAX_CHARS);
}

/** Whole non-negative integers only while typing. */
export function sanitizeStockDraft(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, STOCK_DRAFT_MAX_CHARS);
}

/** Inline validation for product price / stock form fields (non-empty invalid values). */
export function priceInputError(raw: string): string | null {
  const t = raw.trim();
  if (t === '') return null;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n)) return 'Enter a valid price.';
  if (n < 0) return 'Price must be 0 or greater.';
  if (n > PRODUCT_PRICE_MAX) {
    return `Price must be at most ${PRODUCT_PRICE_MAX.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
  }
  return null;
}

export function stockInputError(raw: string): string | null {
  const t = raw.trim();
  if (t === '') return null;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n)) return 'Enter a valid stock value.';
  if (!Number.isInteger(n)) return 'Stock must be a whole number.';
  if (n < 0) return 'Stock must be 0 or greater.';
  if (n > PRODUCT_QUANTITY_STOCK_MAX) {
    return `Stock must be at most ${PRODUCT_QUANTITY_STOCK_MAX.toLocaleString('en-US')}.`;
  }
  return null;
}

export function parsedPrice(raw: string): number | null {
  const t = raw.trim();
  if (t === '') return null;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n < 0 || n > PRODUCT_PRICE_MAX) return null;
  return n;
}

export function parsedStock(raw: string): number | null {
  const t = raw.trim();
  if (t === '') return null;
  const n = Number.parseFloat(t);
  if (
    !Number.isFinite(n) ||
    !Number.isInteger(n) ||
    n < 0 ||
    n > PRODUCT_QUANTITY_STOCK_MAX
  ) {
    return null;
  }
  return n;
}
