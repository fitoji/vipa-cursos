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

type ImportCourseInput = {
  start_date: string;
  place: string;
  teacher?: string;
  country?: string;
  mode: "sit" | "serve";
  days: number;
  obs?: string;
};

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

function revalidateBoth(path: string) {
  revalidatePath(path);
  revalidatePath(`/en${path}`);
}

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
  revalidateBoth("/");
  revalidateBoth("/dashboard");
  return rows[0] as CourseRow;
}

export async function importCourses({ data }: { data: ImportCourseInput[] }) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const parsed = z.array(courseSchema).parse(data);

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  const inserted = await Promise.all(
    parsed.map(
      (c) =>
        sql`
        INSERT INTO vipassana_courses (start_date, place, teacher, country, mode, days, obs, user_id)
        VALUES (${c.start_date}, ${c.place}, ${c.teacher}, ${c.country}, ${c.mode}, ${c.days}, ${c.obs}, ${userId})
        RETURNING id
      `,
    ),
  );
  revalidateBoth("/");
  revalidateBoth("/dashboard");
  return { count: inserted.length };
}

export async function listCourses(): Promise<CourseRow[]> {
  const session = await getSession();
  if (!session?.user?.id) return [];
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
  revalidateBoth("/");
  revalidateBoth("/dashboard");
  return rows[0] as CourseRow;
}

export async function deleteCourse({ data }: { data: { id: number } }) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  await sql`DELETE FROM vipassana_courses WHERE id = ${data.id} AND user_id = ${userId}`;
  revalidateBoth("/");
  revalidateBoth("/dashboard");
  return { ok: true };
}
