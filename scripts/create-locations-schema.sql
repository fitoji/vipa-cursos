-- Schema for vipassana course locations (centers & non-centers worldwide).
-- Run ONCE against Neon:
--   psql "$DATABASE_URL" -f scripts/create-locations-schema.sql

CREATE TABLE IF NOT EXISTS continents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  continent_id INTEGER NOT NULL REFERENCES continents(id) ON DELETE CASCADE,
  region TEXT,
  UNIQUE(name, continent_id)
);

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Center', 'Non-Centre')),
  country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  city TEXT,
  state TEXT,
  province TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_locations_country ON locations(country_id);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);
CREATE INDEX IF NOT EXISTS idx_countries_continent ON countries(continent_id);
