/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Required in `web/.env`; use empty value for dev + Vite proxy. */
  readonly VITE_API_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
