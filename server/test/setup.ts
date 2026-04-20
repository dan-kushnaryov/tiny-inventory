import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';

const serverRoot = resolve(__dirname, '..');
const envTestPath = resolve(serverRoot, '.env.test');

function hasRequiredProcessEnv(): boolean {
  const keys = [
    'PORT',
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_SYNC',
  ] as const;
  return keys.every((k) => {
    const v = process.env[k];
    return v != null && String(v).trim() !== '';
  });
}

if (existsSync(envTestPath)) {
  Object.assign(process.env, loadEnv('test', serverRoot, ''));
} else if (hasRequiredProcessEnv()) {
  // Docker / CI: variables injected (see server/docker-compose.yml, profile `test`).
} else {
  throw new Error(
    'E2e env missing: add server/.env.test (copy .env.test.example) or set PORT and all DB_* variables.',
  );
}
