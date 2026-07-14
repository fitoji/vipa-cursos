"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

async function getSession() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const h = new Headers();
  h.set("cookie", allCookies.map((c) => `${c.name}=${c.value}`).join("; "));
  return auth.api.getSession({ headers: h });
}

const streakSchema = z.object({
  start_date: z.string().min(1),
  end_date: z.string().min(1),
});

export type StreakInput = z.infer<typeof streakSchema>;

type StreakRow = {
  id: number;
  user_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
};

function revalidateBoth(path: string) {
  revalidatePath(path);
  revalidatePath(`/en${path}`);
}

function isStreakActive(endDate: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return endDate >= today;
}

export async function listStreaks(): Promise<StreakRow[]> {
  const session = await getSession();
  if (!session?.user?.id) return [];
  const userId = session.user.id;

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id, user_id, start_date, end_date, is_active, created_at
    FROM meditation_streaks
    WHERE user_id = ${userId}
    ORDER BY start_date DESC, id DESC
  `;
  return rows as StreakRow[];
}

export async function createStreak({ data }: { data: StreakInput }) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const parsed = streakSchema.parse(data);

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  const active = isStreakActive(parsed.end_date);
  const rows = await sql`
    INSERT INTO meditation_streaks (user_id, start_date, end_date, is_active)
    VALUES (${userId}, ${parsed.start_date}, ${parsed.end_date}, ${active})
    RETURNING id, user_id, start_date, end_date, is_active, created_at
  `;
  revalidateBoth("/racha");
  return rows[0] as StreakRow;
}

export async function deleteStreak({ data }: { data: { id: number } }) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  await sql`DELETE FROM meditation_streaks WHERE id = ${data.id} AND user_id = ${userId}`;
  revalidateBoth("/racha");
  return { ok: true };
}

export async function updateStreak({
  data,
}: {
  data: { id: number; end_date: string };
}) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  const active = isStreakActive(data.end_date);
  const rows = await sql`
    UPDATE meditation_streaks
    SET end_date = ${data.end_date}, is_active = ${active}
    WHERE id = ${data.id} AND user_id = ${userId}
    RETURNING id, user_id, start_date, end_date, is_active, created_at
  `;
  revalidateBoth("/racha");
  return rows[0] as StreakRow;
}
