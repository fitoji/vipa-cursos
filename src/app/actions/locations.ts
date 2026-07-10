"use server";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

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

export async function listContinents(): Promise<ContinentRow[]> {
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
}

export async function listCountries(continentId?: number): Promise<CountryRow[]> {
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
}

export async function searchLocations(opts: {
  continentId?: number;
  countryId?: number;
  type?: "Center" | "Non-Centre";
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<{ locations: LocationRow[]; total: number }> {
  const { continentId, countryId, type, query, limit = 50, offset = 0 } = opts;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (continentId) {
    conditions.push(`co.continent_id = $${idx++}`);
    params.push(continentId);
  }
  if (countryId) {
    conditions.push(`l.country_id = $${idx++}`);
    params.push(countryId);
  }
  if (type) {
    conditions.push(`l.type = $${idx++}`);
    params.push(type);
  }
  if (query) {
    conditions.push(`(
      l.name ILIKE $${idx} OR
      l.city ILIKE $${idx} OR
      co.name ILIKE $${idx}
    )`);
    params.push(`%${query}%`);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
  });

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM locations l
       JOIN countries co ON co.id = l.country_id
       JOIN continents c ON c.id = co.continent_id
       ${where}`,
      params,
    );
    const total = countResult.rows[0].total;

    const dataResult = await pool.query(
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
       ${where}
       ORDER BY c.name, co.name, l.name
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset],
    );

    return { locations: dataResult.rows as LocationRow[], total };
  } finally {
    await pool.end();
  }
}
