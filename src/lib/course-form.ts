import { z } from "zod";
import { listCourses } from "@/app/actions/courses";

export type Course = Awaited<ReturnType<typeof listCourses>>[number];

export const DAY_PRESETS = [1, 3, 10, 20, 30, 45, 60] as const;

export const courseFormSchema = z
  .object({
    start_date: z.string().min(1, "Requerido"),
    place: z.string().min(1, "Requerido"),
    teacher: z.string(),
    country: z.string(),
    mode: z.enum(["sit", "serve"]),
    daysPreset: z.string().min(1, "Selecciona una opción"),
    daysCustom: z.string(),
    obs: z.string(),
  })
  .refine((v) => v.daysPreset !== "other" || (!!v.daysCustom && Number(v.daysCustom) > 0), {
    message: "Ingresa la cantidad de días",
    path: ["daysCustom"],
  });

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export const defaultCourseFormValues: CourseFormValues = {
  start_date: "",
  place: "",
  teacher: "",
  country: "",
  mode: "sit",
  daysPreset: "10",
  daysCustom: "",
  obs: "",
};

export function toFormValues(c: Course): CourseFormValues {
  const isPreset = (DAY_PRESETS as readonly number[]).includes(c.days);
  return {
    start_date: c.start_date.slice(0, 10),
    place: c.place,
    teacher: c.teacher ?? "",
    country: c.country ?? "",
    mode: c.mode,
    daysPreset: isPreset ? String(c.days) : "other",
    daysCustom: isPreset ? "" : String(c.days),
    obs: c.obs ?? "",
  };
}

export function daysFromFormValues(values: CourseFormValues): number {
  return values.daysPreset === "other" ? Number(values.daysCustom) : Number(values.daysPreset);
}

export const courseImportSchema = z.object({
  start_date: z.string().min(1, "Requerido"),
  place: z.string().min(1, "Requerido"),
  teacher: z.string().optional(),
  country: z.string().optional(),
  mode: z.enum(["sit", "serve"], {
    errorMap: () => ({ message: 'mode debe ser "sit" o "serve"' }),
  }),
  days: z
    .number({ invalid_type_error: "days debe ser un número" })
    .int("days debe ser entero")
    .positive("days debe ser mayor a 0"),
  obs: z.string().optional(),
});

export type CourseImport = z.infer<typeof courseImportSchema>;

export const courseImportArraySchema = z.array(courseImportSchema);
