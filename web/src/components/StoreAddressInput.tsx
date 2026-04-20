import {
  sanitizeAddressDraft,
  STORE_ADDRESS_MAX_LENGTH,
  STORE_ADDRESS_WARN_THRESHOLD,
} from '../utils/storeFieldErrors';
import { FieldValidationTooltip } from './ui/FieldValidationTooltip';

export type StoreAddressInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  errorMessage: string | null;
  disabled?: boolean;
  rows?: number;
};

/**
 * Optional multiline store address with trim-length counter (CreateStoreDto max 5000).
 */
export function StoreAddressInput({
  id,
  value,
  onChange,
  errorMessage,
  disabled,
  rows = 3,
}: StoreAddressInputProps) {
  const trimmedLen = value.trim().length;
  const countId = `${id}-char-count`;
  const countClass =
    trimmedLen > STORE_ADDRESS_MAX_LENGTH
      ? 'char-count char-count-over'
      : trimmedLen > STORE_ADDRESS_WARN_THRESHOLD
        ? 'char-count char-count-warn'
        : 'char-count';

  return (
    <div className="stack">
      <div
        className="row"
        style={{
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <label htmlFor={id}>Address (optional)</label>
        <span
          id={countId}
          className={countClass}
          aria-live="polite"
          title="Limit applies after trimming leading and trailing spaces."
        >
          {trimmedLen} / {STORE_ADDRESS_MAX_LENGTH.toLocaleString('en-US')}
        </span>
      </div>
      <FieldValidationTooltip message={errorMessage}>
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(sanitizeAddressDraft(e.target.value))}
          disabled={disabled}
          rows={rows}
          autoComplete="street-address"
          spellCheck={true}
          placeholder="Street, city…"
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={countId}
        />
      </FieldValidationTooltip>
    </div>
  );
}
