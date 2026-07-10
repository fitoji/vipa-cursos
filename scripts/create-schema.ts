/**
 * Creates the locations schema in Neon (idempotent — safe to run multiple times).
 *
 * Usage:
 *   pnpm db:schema
 *
 * Reads DATABASE_URL from .env.local automatically.
 */

import { loadEnvFile } from "node:process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnvFile(resolve(__dirname, "../.env.local"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});

const SCHEMA = `
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

CREATE INDEX IF NOT EXISTS idx_locations_country ON locations(country_id);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);
CREATE INDEX IF NOT EXISTS idx_countries_continent ON countries(continent_id);
`;

async function main() {
  const client = await pool.connect();
  try {
    await client.query(SCHEMA);
    console.log("✅ Schema created (idempotent — safe to re-run).");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ Schema creation failed:", err);
  process.exit(1);
});
