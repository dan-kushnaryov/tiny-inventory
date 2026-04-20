/**
 * Web public env (`VITE_*`). All values must come from `web/.env` — no fallbacks in code.
 */

function readApiBase(): string {
  const v = import.meta.env.VITE_API_URL;
  if (v === undefined) {
    throw new Error(
      'Missing VITE_API_URL in web/.env. Copy web/.env.example to web/.env. For dev with the Vite proxy, set an empty value: VITE_API_URL=',
    );
  }
  return v.trim().replace(/\/$/, '');
}

/** Fail fast on startup if `VITE_API_URL` is absent from env. */
export function assertClientEnv(): void {
  readApiBase();
}

/** Base URL for `fetch` (empty string = same origin, dev proxy). */
export function getApiBase(): string {
  return readApiBase();
}
