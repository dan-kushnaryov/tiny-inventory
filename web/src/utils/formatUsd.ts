/**
 * Stable USD display for tables (avoids browser `US$` / locale quirks from
 * `toLocaleString(undefined, { style: 'currency' })`).
 */
export function formatUsd(amount: number): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) {
    return '—';
  }
  return `$${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
