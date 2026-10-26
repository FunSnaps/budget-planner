# 50/30/20 Budget Planner

A full-stack budget planner built around the 50/30/20 rule (needs / wants / savings), with saved budgets, share links, and a page for splitting shared bills in proportion to income.

## Features

- **Budget planner**: enter monthly take-home, log line items under Needs, Wants and Savings, and see gauges against the 50/30/20 targets.
- **Gross salary helper**: estimates take-home from gross salary (UK 2024/25 income tax + NI).
- **Bonus and one-off costs**: log windfalls and split them across categories; track annual costs as a monthly set-aside.
- **Saved budgets**: snapshot, reload and delete named budgets. The active budget auto-saves.
- **Share links**: read-only link to a saved budget, no login needed.
- **Split bills by income** (`/split`): divide shared bills by take-home or gross salary instead of 50/50, with per-bill payer and a settle-up summary. Stored in the browser only.
- **Accounts**: email and password sign-up, session cookies.

## Architecture

```
Browser
  │
  ▼
SvelteKit on Vercel    auth (Lucia) + proxy routes
  │  X-User-Id header, set only after the session is validated
  ▼
FastAPI on Railway     business logic
  │
  ▼
Neon PostgreSQL
```

Both halves follow Clean Architecture: domain → application → infrastructure/presentation, with dependencies only pointing inward.

| Part | Stack | Location |
|---|---|---|
| Frontend | SvelteKit 2, Svelte 4, TypeScript, Lucia v3, `@node-rs/argon2` | [frontend/](frontend/) |
| API | FastAPI, SQLAlchemy 2 (async), asyncpg, Alembic | [api/](api/) |
| Database | Neon PostgreSQL | [db/001_initial.sql](db/001_initial.sql) |

### Repository layout

```
api/
  app/domain/          entities + repository ports (no framework imports)
  app/application/     use cases and DTOs
  app/infrastructure/  SQLAlchemy models/repositories, DB engine, config
  app/presentation/    FastAPI routers, schemas, dependencies
  alembic/             migrations
  tests/               unit (mock repos) and integration (SQLite)
frontend/src/
  lib/domain/          entities, planner + split logic (pure TypeScript)
  lib/application/     Svelte stores and use cases
  lib/infrastructure/  browser HTTP client
  lib/presentation/    Svelte components
  lib/server/          Lucia setup, server-side API client
  routes/              pages, auth, and /api proxy routes
```

### API endpoints

All under `/api/v1`, plus `GET /health`. Routes under `/users/{user_id}` need a matching `X-User-Id` header.

| Method | Path | Purpose |
|---|---|---|
| GET / PUT | `/users/{user_id}/budget/active` | Read / update the active budget |
| GET / POST | `/users/{user_id}/budget/saves` | List / create saved budgets |
| PATCH / DELETE | `/users/{user_id}/budget/saves/{budget_id}` | Rename or update / delete a save |
| POST | `/users/{user_id}/budget/saves/{budget_id}/share` | Create a share link |
| GET | `/shared/{token}` | Resolve a share link (public) |

## Local development

Prerequisites: Python 3.12, Node 20+, pnpm, a PostgreSQL database (a free [Neon](https://neon.tech) project works).

### API

```bash
cd api
python -m venv .venv
.venv/Scripts/activate            # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL="postgresql://user:password@host/dbname"
alembic upgrade head              # use the direct (non-pooler) Neon URL for migrations
uvicorn app.presentation.main:app --reload
```

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | required | Postgres connection string. `sslmode` and `channel_binding` params are normalised for asyncpg. |
| `ALLOWED_ORIGIN` | `http://localhost:5173` | CORS origin of the frontend |
| `ENV` | `development` | Environment name |

### Frontend

```bash
cd frontend
cp .env.example .env              # then fill in values
pnpm install
pnpm dev
```

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Same database; used by Lucia for users and sessions (pooler URL is fine) |
| `API_URL` | Base URL of the FastAPI service |
| `NODE_ENV` | `production` enables secure cookies |

## Tests

```bash
cd api && pytest                  # unit + integration
cd frontend && pnpm test          # vitest unit tests
cd frontend && pnpm test:e2e      # Playwright (needs the app running)
```

## Deployment

- **API → Railway.** Root directory `api`, built from the Dockerfile. Railway injects `PORT`. Set `DATABASE_URL` and `ALLOWED_ORIGIN` (the Vercel URL).
- **Frontend → Vercel.** Root directory `frontend`, build command `pnpm run build`. Set `DATABASE_URL`, `API_URL` and `NODE_ENV=production`.
- **Database → Neon.** Run `alembic upgrade head` against the direct connection string.
