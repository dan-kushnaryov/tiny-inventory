import type { ApiErrorBody } from './types';
import { getApiBase } from '../env';

/** Same as `getApiBase()` — base URL from `VITE_API_URL` in `web/.env`. */
export function apiBase(): string {
  return getApiBase();
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const base = apiBase();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(typeof init?.body === 'string'
      ? { 'Content-Type': 'application/json' }
      : {}),
  };
  if (init?.headers) {
    Object.assign(headers, init.headers as Record<string, string>);
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let detail: string = res.statusText;
    try {
      const body = (await res.json()) as ApiErrorBody;
      if (body.message) {
        detail = Array.isArray(body.message)
          ? body.message.join(', ')
          : body.message;
      }
      if (body.code) {
        detail = `${detail} (${body.code})`;
      }
    } catch {
      /* ignore */
    }
    throw new Error(`${res.status} ${detail}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
