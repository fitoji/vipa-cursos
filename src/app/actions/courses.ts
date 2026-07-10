"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

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
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    INSERT INTO vipassana_courses (start_date, place, teacher, country, mode, days, obs)
    VALUES (${data.start_date}, ${data.place}, ${data.teacher}, ${data.country}, ${data.mode}, ${data.days}, ${data.obs})
    RETURNING id, start_date, place, teacher, country, mode, days, obs, created_at
  `;
  revalidatePath("/");
  revalidatePath("/dashboard");
  return rows[0] as CourseRow;
}

export async function listCourses(): Promise<CourseRow[]> {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id, start_date, place, teacher, country, mode, days, obs, created_at
    FROM vipassana_courses
    ORDER BY start_date DESC, id DESC
  `;
  return rows as CourseRow[];
}

const updateSchema = courseSchema.extend({ id: z.number().int().positive() });

export async function updateCourse({ data }: { data: z.infer<typeof updateSchema> }) {
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
    WHERE id = ${data.id}
    RETURNING id, start_date, place, teacher, country, mode, days, obs, created_at
  `;
  revalidatePath("/");
  revalidatePath("/dashboard");
  return rows[0] as CourseRow;
}

export async function deleteCourse({ data }: { data: { id: number } }) {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  await sql`DELETE FROM vipassana_courses WHERE id = ${data.id}`;
  revalidatePath("/");
  revalidatePath("/dashboard");
  return { ok: true };
}
