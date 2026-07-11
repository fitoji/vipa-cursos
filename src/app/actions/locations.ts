"use server";

import { neon } from "@neondatabase/serverless";
import { unstable_cache } from "next/cache";

const sql = neon(process.env.DATABASE_URL!);

// Shared cache config — centers data is static, seeded from JSON
const LOCATIONS_TAG = "locations";
const ONE_DAY = 86400;

// ── Types ──────────────────────────────────────────────────────────────────

export type ContinentRow = {
  id: number;
  name: string;
  location_count: number;
};

export type CountryRow = {
  id: number;
  name: string;
  region: string | null;
  location_count: number;
};

export type LocationRow = {
  id: number;
  name: string;
  type: "Center" | "Non-Centre";
  city: string | null;
  state: string | null;
  province: string | null;
  country_name: string;
  continent_name: string;
};

// ── Queries ────────────────────────────────────────────────────────────────

export const listContinents = unstable_cache(
  async (): Promise<ContinentRow[]> => {
    const rows = await sql`
    SELECT
      c.id,
      c.name,
      COUNT(l.id)::int AS location_count
    FROM continents c
    LEFT JOIN countries co ON co.continent_id = c.id
    LEFT JOIN locations l ON l.country_id = co.id
    GROUP BY c.id, c.name
    ORDER BY c.name
  `;
    return rows as ContinentRow[];
  },
  ["continents"],
  { revalidate: ONE_DAY, tags: [LOCATIONS_TAG] },
);

export const listCountries = unstable_cache(
  async (continentId?: number): Promise<CountryRow[]> => {
    const rows = continentId
      ? await sql`
        SELECT
          co.id,
          co.name,
          co.region,
          COUNT(l.id)::int AS location_count
        FROM countries co
        LEFT JOIN locations l ON l.country_id = co.id
        WHERE co.continent_id = ${continentId}
        GROUP BY co.id, co.name, co.region
        ORDER BY co.name
      `
      : await sql`
        SELECT
          co.id,
          co.name,
          co.region,
          COUNT(l.id)::int AS location_count
        FROM countries co
        LEFT JOIN locations l ON l.country_id = co.id
        GROUP BY co.id, co.name, co.region
        ORDER BY co.name
      `;
    return rows as CountryRow[];
  },
  ["countries-all"],
  { revalidate: ONE_DAY, tags: [LOCATIONS_TAG] },
);

export const searchLocations = unstable_cache(
  async (opts: {
    continentId?: number;
    countryId?: number;
    type?: "Center" | "Non-Centre";
    query?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ locations: LocationRow[]; total: number }> => {
    const { continentId, countryId, type, query, limit = 50, offset = 0 } = opts;

    const whereParts: string[] = ["1=1"];
    if (continentId) whereParts.push(`co.continent_id = ${continentId}`);
    if (countryId) whereParts.push(`l.country_id = ${countryId}`);
    if (type) whereParts.push(`l.type = '${type}'`);
    if (query) {
      const safe = query.replace(/'/g, "''");
      whereParts.push(
        `(l.name ILIKE '%${safe}%' OR l.city ILIKE '%${safe}%' OR co.name ILIKE '%${safe}%')`,
      );
    }
    const whereClause = whereParts.join(" AND ");

    const countRows = (await sql.unsafe(
      `SELECT COUNT(*)::int AS total
       FROM locations l
       JOIN countries co ON co.id = l.country_id
       JOIN continents c ON c.id = co.continent_id
       WHERE ${whereClause}`,
    )) as unknown as { total: number }[];
    const total = countRows[0].total;

    const dataRows = (await sql.unsafe(
      `SELECT
         l.id,
         l.name,
         l.type,
         l.city,
         l.state,
         l.province,
         co.name AS country_name,
         c.name AS continent_name
       FROM locations l
       JOIN countries co ON co.id = l.country_id
       JOIN continents c ON c.id = co.continent_id
       WHERE ${whereClause}
       ORDER BY c.name, co.name, l.name
       LIMIT ${limit} OFFSET ${offset}`,
    )) as unknown as LocationRow[];

    return { locations: dataRows, total };
  },
  ["search-locations"],
  { revalidate: ONE_DAY, tags: [LOCATIONS_TAG] },
);

export const listCountryNames = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await sql`
    SELECT DISTINCT name FROM countries ORDER BY name
  `;
    return (rows as { name: string }[]).map((r) => r.name);
  },
  ["country-names"],
  { revalidate: ONE_DAY, tags: [LOCATIONS_TAG] },
);

export const listLocationNamesByCountry = unstable_cache(
  async (country?: string): Promise<string[]> => {
    if (!country) {
      const rows = await sql`
      SELECT DISTINCT l.name FROM locations l ORDER BY l.name
    `;
      return (rows as { name: string }[]).map((r) => r.name);
    }
    const rows = await sql`
    SELECT DISTINCT l.name
    FROM locations l
    JOIN countries co ON co.id = l.country_id
    WHERE co.name = ${country}
    ORDER BY l.name
  `;
    return (rows as { name: string }[]).map((r) => r.name);
  },
  ["location-names"],
  { revalidate: ONE_DAY, tags: [LOCATIONS_TAG] },
);
