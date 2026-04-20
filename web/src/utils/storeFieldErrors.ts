import { stripControlChars } from './sanitizeText';

/** Matches `CreateStoreDto` `@MaxLength` on `address`. */
export const STORE_ADDRESS_MAX_LENGTH = 5000;

/** Hard cap on raw address while typing (after sanitize). */
export const STORE_ADDRESS_MAX_INPUT_CHARS = 5200;

/** Warn counter color when approaching limit (same ratio as name ~94%). */
export const STORE_ADDRESS_WARN_THRESHOLD = 4_700;

/** Strip C0 control chars but keep newlines and tabs for multiline addresses. */
export function sanitizeAddressDraft(raw: string): string {
  return stripControlChars(raw).slice(0, STORE_ADDRESS_MAX_INPUT_CHARS);
}

export function storeAddressLengthError(trimmed: string): string | null {
  if (trimmed.length > STORE_ADDRESS_MAX_LENGTH) {
    return `Address must be at most ${STORE_ADDRESS_MAX_LENGTH.toLocaleString('en-US')} characters.`;
  }
  return null;
}
