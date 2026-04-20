/**
 * Removes ASCII control chars except tab/newline/carriage return.
 * Uses Unicode control category to keep implementation compact and readable.
 */
export function stripControlChars(raw: string): string {
  return raw.replace(/\p{Cc}/gu, (ch) =>
    ch === '\t' || ch === '\n' || ch === '\r' ? ch : '',
  );
}
