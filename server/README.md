# Tiny Inventory — API

NestJS (TypeScript) REST service for **stores** and **products**, backed by **PostgreSQL** via TypeORM. Docker Compose for backend services lives in **`docker-compose.yml`**.

---

## Prerequisites

- **Node.js** **22.22.2** and **npm** **10.9.7** (see `package.json` → `engines`, `.tool-versions`, `.nvmrc`, and `Dockerfile` image `node:22.22.2-alpine`). With [asdf](https://asdf-vm.com/), run `asdf install` from the project root. With [nvm](https://github.com/nvm-sh/nvm), run `nvm use` in the project root. **`.npmrc`** sets `engine-strict=true` — installs fail if versions do not match `engines`.
- **Docker** and **Docker Compose** v2 (for Postgres and optional containerized dev/e2e)

---

## Configuration

| File | Purpose |
|------|--------|
| `.env` | Required for Nest (`PORT`, `DB_*`, `DB_SYNC`). Copy from `.env.example`. |
| `.env.test` | Used for **e2e on the host** (`npm run test:e2e`). Copy from `.env.test.example`. |
| `docker-compose.yml` | Backend services: `postgres`, `app`, optional `fixtures` (profile `fixtures`), and `postgres_test` + `e2e` (profile `test`). |

**Local Nest + Postgres in Docker:** run `docker compose up -d postgres`, then in `.env` use `DB_HOST=localhost` and `DB_PORT` equal to the published dev Postgres port (default **5433**, or your `KNOSTIC_DEV_DB_PORT`).

**Nest in Docker:** `npm run start:dev:docker` uses this compose file and reads `.env`; the `app` service overrides `DB_HOST` / `DB_PORT` for the container network.

---

## Install dependencies

```bash
npm install
```

---

## Run Postgres (Docker)

```bash
docker compose up -d postgres
```

---

## Commands (`npm run …` from project root)

| Script | What it does |
|--------|----------------|
| `build` | `nest build` — compile to `dist/`. |
| `start` | `nest start` — run once (no watch). |
| `start:dev` | `nest start --watch` — **local** dev server; needs Postgres reachable per `.env`. |
| `start:debug` | Nest in watch mode with debugger. |
| `start:prod` | `node dist/main` — run compiled app (after `build`). |
| `start:dev:docker` | `docker compose -f docker-compose.yml up --build app -d` — build/run **API in Docker** (uses `docker-compose.yml`; Compose reads `.env`). |
| `lint` | ESLint on `src/` and `test/` (with `--fix`). |
| `format` | Prettier on `src/**/*.ts` and `test/**/*.ts`. |
| `test` | Vitest **unit** tests (`src/**/*.spec.ts`). |
| `test:watch` | Vitest in watch mode. |
| `test:cov` | Unit tests with **coverage** (v8). |
| `test:e2e` | Vitest **e2e** (`test/**/*.e2e-spec.ts`); requires `.env.test` or full `DB_*` + `PORT` in the environment. |
| `test:e2e:docker` | `docker compose -f docker-compose.yml --profile test run --rm e2e` — e2e in a one-shot container. |
| `seed:fixtures` | `npm run build` then `node dist/fixtures/run-fixtures.js` — **truncate** store/product tables and insert demo data (uses `.env`). |
| `seed:fixtures:docker` | `docker compose -f docker-compose.yml --profile fixtures run --rm fixtures` — optional one-shot fixtures in Docker. |

**Seed in Docker (optional):**

```bash
docker compose -f docker-compose.yml --profile fixtures run --rm fixtures
```

---

## Docker Compose reference

| Command (cwd) | Result |
|---------------|--------|
| `docker compose up -d postgres` | Start dev Postgres in background. |
| `docker compose up --build app -d` | Build and start API container. |
| `docker compose --profile fixtures run --rm fixtures` | Optional one-shot fixtures load. |
| `docker compose --profile test run --rm e2e` | Ephemeral **test Postgres** + **e2e** job. |

**Optional overrides:** set `KNOSTIC_*` in `.env` to customize published ports.

---

## API sketch (REST)

- `GET /` — health-style greeting.  
- **Stores:** `POST/GET /stores`, `GET/PATCH/DELETE /stores/:id`, `GET /stores/:id/stats` (aggregated inventory metrics).  
- **Products:** `POST/GET /products`, `GET/PATCH/DELETE /products/:id`. List supports **pagination** (`page`, `limit`) and **filters** (`storeId`, `categoryId`, `minPrice`/`maxPrice`, `minStock`/`maxStock`) plus optional `include=store` to embed the owning store.

---

## Decisions & trade-offs

- **Postgres + TypeORM** — durable, familiar for inventory; `synchronize` + Joi `DB_SYNC` keeps local/dev friction low at the cost of not being migration-first for this exercise.  
- **Store stats** implemented as one **SQL snapshot** (CTE + aggregates) for a clear non-CRUD endpoint with predictable cost vs. N+1 ORM queries.  
- **Docker profiles** keep optional flows explicit: **fixtures** (one-shot seed) and **test** (tmpfs Postgres + one-shot e2e). Core backend services are `postgres` and `app`.  
- **Validation:** global `ValidationPipe` (whitelist, transform) + DTOs; domain errors mapped to HTTP via small **exception filters** with stable `code` fields.  
- **Seeding** is a **command**, not automatic on boot — avoids surprise data wipes in shared DBs; reviewers run `seed:fixtures` once after `up`.  
- **Compose layout:** backend services are defined in a single `docker-compose.yml` for local dev, fixtures, and e2e flows.

---

## Testing approach

- **Unit tests (Vitest):** `src/**/*.spec.ts`, lightweight `setup` (`test/setup-unit.ts`), heavy use of `@nestjs/testing` and mocks for repositories/services. Fast feedback, no DB required.  
- **E2e tests (Vitest):** `test/**/*.e2e-spec.ts`, real HTTP via `supertest` against a Nest app wired to Postgres; `test/setup.ts` loads `.env.test` when present. **Docker e2e** uses Compose profile `test` so CI/local can run without a host `.env.test`.  
- **Rationale:** unit tests lock behavior of services, mappers, and validation; e2e tests lock routing, persistence, and error shapes end-to-end.

---

## If I had more time

- Adopt a **migrations-first** workflow and keep TypeORM `synchronize` disabled in all non-dev environments.  
- Add **authentication and authorization** (e.g., JWT/OIDC + role/resource checks) to protect CRUD endpoints and stats access.  
- Improve **production hardening and observability** with structured logs, request correlation IDs, metrics/alerts, and rate limiting.
