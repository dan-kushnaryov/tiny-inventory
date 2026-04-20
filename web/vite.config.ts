import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function requireEnv(env: Record<string, string>, key: string): string {
  const v = env[key]?.trim();
  if (!v) {
    throw new Error(
      `web/.env: ${key} is required (non-empty). See web/.env.example.`,
    );
  }
  return v;
}

function requireEnvPort(env: Record<string, string>, key: string): number {
  const raw = requireEnv(env, key);
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1 || n > 65535) {
    throw new Error(`web/.env: ${key} must be an integer 1–65535 (got ${raw})`);
  }
  return n;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const apiTarget = requireEnv(env, 'VITE_PROXY_API');
  const port = requireEnvPort(env, 'VITE_DEV_PORT');

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return;
            }
            const marker = `${path.posix.sep}node_modules${path.posix.sep}`;
            const afterNodeModules = id.split(marker).at(-1);
            if (!afterNodeModules) {
              return;
            }
            const parts = afterNodeModules.split(path.posix.sep);
            const pkg =
              parts[0]?.startsWith('@') && parts[1]
                ? `${parts[0]}/${parts[1]}`
                : parts[0];
            if (!pkg) {
              return;
            }

            if (pkg === 'recharts') {
              return 'charts-vendor';
            }
            if (pkg === 'react' || pkg === 'react-dom' || pkg === 'scheduler') {
              return 'react-vendor';
            }
            if (pkg === 'react-router' || pkg === 'react-router-dom') {
              return 'router-vendor';
            }
            if (pkg.startsWith('@tanstack/')) {
              return 'query-vendor';
            }
            if (pkg.startsWith('@radix-ui/')) {
              return 'radix-vendor';
            }
            return 'vendor';
          },
        },
      },
    },
    server: {
      port,
      proxy: {
        '^/(stores|products|categories)(/|$)': {
          target: apiTarget,
          changeOrigin: true,
          /**
           * Browser navigation / refresh must get the SPA. Returning false from bypass
           * makes Vite respond with 404; rewrite to index.html instead (see Vite proxy middleware).
           * API fetch() does not use Accept: text/html.
           */
          bypass(req) {
            const accept = req.headers.accept ?? '';
            if (accept.includes('text/html')) {
              return '/index.html';
            }
          },
        },
      },
    },
  };
});
