-- Use snake_case column names (recommended SQL convention). The application
-- code maps between camelCase (used in TypeScript) and snake_case (DB).

CREATE TABLE IF NOT EXISTS public.history (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  job_description TEXT NOT NULL,
  resume TEXT,
  output TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional: create an index for faster lookups by created_at
CREATE INDEX IF NOT EXISTS history_created_at_idx ON public.history (created_at DESC);
