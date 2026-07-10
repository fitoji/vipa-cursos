-- Migration: scope vipassana_courses per user.
-- Run this ONCE against Neon (SQL editor or `psql`) after Better Auth tables exist.
-- 1. Add the owning user column.
ALTER TABLE vipassana_courses ADD COLUMN user_id TEXT;

-- 2. Backfill existing rows to a legacy owner so the NOT NULL constraint can be applied.
UPDATE vipassana_courses SET user_id = 'legacy-owner-migration' WHERE user_id IS NULL;

-- 3. Enforce ownership.
ALTER TABLE vipassana_courses ALTER COLUMN user_id SET NOT NULL;
