"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

async function getSession() {
  // In Next.js 16 server actions, cookies() gives us the request cookies reliably.
  // We call our own /api/auth/get-session endpoint instead of auth.api.getSession
  // to avoid header-passing issues with Turbopack.
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const origin = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const res = await fetch(`${origin}/api/auth/get-session`, {
    headers: { Cookie: cookieHeader },
  });
  if (!res.ok) return null;
  return res.json();
}

const courseSchema = z.object({
  start_date: z.string().min(1),
  place: z.string().min(1),
  teacher: z.string().optional().default(""),
  country: z.string().optional().default(""),
  mode: z.enum(["sit", "serve"]),
  days: z.number().int().positive(),
  obs: z.string().optional().default(""),
});

export type CourseInput = z.infer<typeof courseSchema>;

type CourseRow = {
  id: number;
  start_date: string;
  place: string;
  teacher: string | null;
  country: string | null;
  mode: "sit" | "serve";
  days: number;
  obs: string | null;
  created_at: string;
};

export async function createCourse({ data }: { data: CourseInput }) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    INSERT INTO vipassana_courses (start_date, place, teacher, country, mode, days, obs, user_id)
    VALUES (${data.start_date}, ${data.place}, ${data.teacher}, ${data.country}, ${data.mode}, ${data.days}, ${data.obs}, ${userId})
    RETURNING id, start_date, place, teacher, country, mode, days, obs, created_at
  `;
  revalidatePath("/");
  revalidatePath("/dashboard");
  return rows[0] as CourseRow;
}

export async function listCourses(): Promise<CourseRow[]> {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id, start_date, place, teacher, country, mode, days, obs, created_at
    FROM vipassana_courses
    WHERE user_id = ${userId}
    ORDER BY start_date DESC, id DESC
  `;
  return rows as CourseRow[];
}

const updateSchema = courseSchema.extend({ id: z.number().int().positive() });

export async function updateCourse({ data }: { data: z.infer<typeof updateSchema> }) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    UPDATE vipassana_courses
    SET start_date = ${data.start_date},
        place = ${data.place},
        teacher = ${data.teacher},
        country = ${data.country},
        mode = ${data.mode},
        days = ${data.days},
        obs = ${data.obs}
    WHERE id = ${data.id} AND user_id = ${userId}
    RETURNING id, start_date, place, teacher, country, mode, days, obs, created_at
  `;
  revalidatePath("/");
  revalidatePath("/dashboard");
  return rows[0] as CourseRow;
}

export async function deleteCourse({ data }: { data: { id: number } }) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  await sql`DELETE FROM vipassana_courses WHERE id = ${data.id} AND user_id = ${userId}`;
  revalidatePath("/");
  revalidatePath("/dashboard");
  return { ok: true };
}
