# Tiny Inventory — Web

**Vite 6 + React 19 + TypeScript**, **React Router 7**, **TanStack Query**, **Recharts** (store stats bar chart). Global styles in `src/index.css` (no Tailwind).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server; port and API proxy come from **`web/.env`** (`VITE_DEV_PORT`, `VITE_PROXY_API`). |
| `npm run build` | Production bundle → `dist/`. |
| `npm run preview` | Serve `dist/` locally — set **`VITE_API_URL`** to your API if not using a reverse proxy. |

## Routes

| Path | Screen |
|------|--------|
| `/stores` | List + create store |
| `/stores/:id` | Edit / delete store |
| `/stores/:id/products` | Products for this store (same API as `/products?storeId=…`) |
| `/stores/:id/stats` | KPI cards + **Recharts** horizontal bar + table |
| `/products` | List + filters + create product |
| `/products/:id` | Edit / delete product |

## Env

1. Copy **`web/.env.example`** → **`web/.env`**.
2. Fill every variable — there are **no default values** in application code.
   - **`VITE_DEV_PORT`** — TCP port for `npm run dev`.
   - **`VITE_PROXY_API`** — Nest base URL for the dev proxy (match `PORT` in `server/.env`).
   - **`VITE_API_URL`** — Base URL for `fetch()`. Set **`http://localhost:3000`** (or your Nest URL) so requests go **directly** to the API (what you see in Network). Use **empty** (`VITE_API_URL=`) if you want same-origin URLs to the Vite port and rely on the **proxy** (`VITE_PROXY_API`) — then Network shows `:5173`, not `:3000`.

## Default local URL

- Web app (`web`): `http://localhost:5173`

## Docker note

Web app can run standalone in Docker (`Vite build -> nginx`) via:

```bash
cd web
npm run docker:up
```

The script uses `docker compose` in `web/`, so Compose reads **`web/.env`**.

## If I had more time

- Add frontend observability and alerting: capture runtime errors (for example via Sentry), track Core Web Vitals, and set alerts for error-rate or performance regressions.
- Improve delivery-level performance further with precompressed Brotli/Gzip assets and explicit cache policy for `index.html` vs hashed static assets.
- Extend UI tests around the highest-risk user journeys (create/edit/delete + validation/error alerts) and include them in CI quality gates.
