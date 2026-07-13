-- Add is_at column to track AT (serving as Assistant Teacher) variant
-- Non-destructive ADD COLUMN with default, safe to run on live DB
ALTER TABLE vipassana_courses ADD COLUMN IF NOT EXISTS is_at BOOLEAN NOT NULL DEFAULT false;

-- Optional: enforce consistency — is_at can only be true when mode = 'serve'
ALTER TABLE vipassana_courses ADD CONSTRAINT is_at_requires_serve CHECK (is_at = false OR mode = 'serve');
