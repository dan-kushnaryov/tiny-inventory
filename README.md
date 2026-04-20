# Knostic — Tiny Inventory

This repository contains two app projects:

- `server/` — NestJS + PostgreSQL API
- `web/` — Vite + React frontend

Each project has its own README and should be treated as an independent app.  
The repository root is only for cross-project orchestration (shared Docker workflows and bootstrap scripts).

## Prerequisites

- Docker + Docker Compose v2
- Bash-compatible shell (for `scripts/dev-up.sh`)
- Node.js 22.22.2 and npm 10.9.7 (needed when running app-local commands in `server/` or `web/`)

## Project docs

- Backend: `server/README.md`
- Frontend: `web/README.md`
- Bootstrap script: `scripts/dev-up.sh`

## Quick start (manual)

Start and run each app using its own README:

1. Backend setup/run: `server/README.md`
2. Frontend setup/run: `web/README.md`

Default local URLs:

- `server` (Nest API): `http://localhost:3000`
- `web` (Vite dev server): `http://localhost:5173`

## Quick start (one command)

From repository root:

**Recommended reviewer command (full stack + fixtures):**

```bash
./scripts/dev-up.sh --with-fixtures
```

```bash
# Start full stack without fixtures (creates missing .env files from .env.example)
./scripts/dev-up.sh

# Same, with fixtures
./scripts/dev-up.sh --with-fixtures
```

Manual alternative (plain Docker Compose, full stack + fixtures):

```bash
docker compose up --build -d && docker compose --profile fixtures run --rm fixtures
```

## Docker from root

```bash
# Build and run stack
docker compose --env-file .env up --build -d

# Optional fixture load
docker compose --env-file .env --profile fixtures run --rm fixtures

# E2e run (ephemeral test DB + test job)
docker compose --env-file .env --profile test run --rm e2e
```

## API sketch

- Backend API sketch: [`server/README.md#api-sketch-rest`](server/README.md#api-sketch-rest)
- Frontend routes overview: [`web/README.md#routes`](web/README.md#routes)

## Decisions & trade-offs

- Backend decisions: [`server/README.md#decisions--trade-offs`](server/README.md#decisions--trade-offs)
- Frontend stack and behavior: [`web/README.md`](web/README.md)

## Testing approach

- Backend testing approach: [`server/README.md#testing-approach`](server/README.md#testing-approach)
- Frontend test setup: [`web/package.json` scripts](web/package.json) and [`web/src/**/*.test.tsx`](web/src)
- Docker e2e flow: `docker compose --env-file .env --profile test run --rm e2e`

## If I had more time

- Web: [`If I had more time` in `web/README.md`](web/README.md#if-i-had-more-time)
- Server: [`If I had more time` in `server/README.md`](server/README.md#if-i-had-more-time)
