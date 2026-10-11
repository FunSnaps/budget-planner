-- Lucia auth tables
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  hashed_password TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Budget data
CREATE TABLE IF NOT EXISTS budgets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT,
  state      JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exactly one active (name IS NULL) budget per user
CREATE UNIQUE INDEX IF NOT EXISTS budgets_active_uidx ON budgets (user_id) WHERE name IS NULL;
CREATE INDEX IF NOT EXISTS budgets_user_idx ON budgets (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS shares (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id   UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  permission  TEXT NOT NULL CHECK (permission IN ('view', 'edit')),
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shares_token_idx ON shares (token);
