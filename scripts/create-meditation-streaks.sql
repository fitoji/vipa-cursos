-- Schema for meditation streaks (daily practice tracking).
-- Run ONCE against Neon:
--   psql "$DATABASE_URL" -f scripts/create-meditation-streaks.sql

CREATE TABLE IF NOT EXISTS meditation_streaks (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_streaks_user ON meditation_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_active ON meditation_streaks(user_id, is_active);
