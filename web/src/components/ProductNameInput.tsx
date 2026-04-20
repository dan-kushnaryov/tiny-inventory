import {
  clampProductNameRawInput,
  PRODUCT_NAME_MAX_LENGTH,
} from '../utils/productFieldErrors';
import { FieldValidationTooltip } from './ui/FieldValidationTooltip';

export type ProductNameInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  errorMessage: string | null;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Defaults to "Name". */
  label?: string;
  placeholder?: string;
  /** Warn color when trimmed length exceeds this (defaults 240 for 255 max). */
  warnCharThreshold?: number;
};

/**
 * Single-line product name: live character count (trimmed length vs API limit),
 * no silent 255 cut on paste — over-limit shows tooltip + counter in red.
 */
export function ProductNameInput({
  id,
  value,
  onChange,
  errorMessage,
  disabled,
  autoFocus,
  label = 'Name',
  placeholder,
  warnCharThreshold = 240,
}: ProductNameInputProps) {
  const trimmedLen = value.trim().length;
  const countId = `${id}-char-count`;
  const countClass =
    trimmedLen > PRODUCT_NAME_MAX_LENGTH
      ? 'char-count char-count-over'
      : trimmedLen > warnCharThreshold
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
        <label htmlFor={id}>{label}</label>
        <span
          id={countId}
          className={countClass}
          aria-live="polite"
          title="Limit applies after trimming leading and trailing spaces."
        >
          {trimmedLen} / {PRODUCT_NAME_MAX_LENGTH}
        </span>
      </div>
      <FieldValidationTooltip message={errorMessage}>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(clampProductNameRawInput(e.target.value))}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder={placeholder}
          spellCheck={true}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={countId}
        />
      </FieldValidationTooltip>
    </div>
  );
}
