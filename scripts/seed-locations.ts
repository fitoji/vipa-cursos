/**
 * Seed script: reads vipassana-cursos.json and inserts into continents → countries → locations.
 *
 * Usage:
 *   pnpm db:seed
 *
 * Reads DATABASE_URL from .env.local automatically.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvFile } from "node:process";
import { Pool } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnvFile(resolve(__dirname, "../.env.local"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});

type LocationEntry = {
  name: string;
  city?: string | null;
  state?: string | null;
  province?: string | null;
};

type CountryEntry = {
  name: string;
  region?: string;
  centers: LocationEntry[];
  non_centers: LocationEntry[];
};

type ContinentEntry = {
  name: string;
  countries: CountryEntry[];
};

type VipassanaData = {
  continents: ContinentEntry[];
};

async function main() {
  const jsonPath = resolve(__dirname, "../src/data/vipassana-cursos.json");
  const raw = readFileSync(jsonPath, "utf-8");
  const data: VipassanaData = JSON.parse(raw);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let totalContinents = 0;
    let totalCountries = 0;
    let totalLocations = 0;

    for (const continent of data.continents) {
      const continentRow = await client.query(
        `INSERT INTO continents (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [continent.name],
      );
      const continentId = continentRow.rows[0].id;
      totalContinents++;

      for (const country of continent.countries) {
        const countryRow = await client.query(
          `INSERT INTO countries (name, continent_id, region)
           VALUES ($1, $2, $3)
           ON CONFLICT (name, continent_id) DO UPDATE SET region = EXCLUDED.region
           RETURNING id`,
          [country.name, continentId, country.region || null],
        );
        const countryId = countryRow.rows[0].id;
        totalCountries++;

        const allLocations: (LocationEntry & { type: "Center" | "Non-Centre" })[] = [
          ...country.centers.map((c) => ({ ...c, type: "Center" as const })),
          ...country.non_centers.map((nc) => ({ ...nc, type: "Non-Centre" as const })),
        ];

        for (const loc of allLocations) {
          await client.query(
            `INSERT INTO locations (name, type, country_id, city, state, province)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              loc.name,
              loc.type,
              countryId,
              loc.city || null,
              loc.state || null,
              loc.province || null,
            ],
          );
          totalLocations++;
        }
      }
    }

    await client.query("COMMIT");

    console.log(`✅ Seed complete:`);
    console.log(`   Continents: ${totalContinents}`);
    console.log(`   Countries:  ${totalCountries}`);
    console.log(`   Locations:  ${totalLocations}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
