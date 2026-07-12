import { z } from "zod";
import { listCourses } from "@/app/actions/courses";

export type Course = Awaited<ReturnType<typeof listCourses>>[number];

export const DAY_PRESETS = [1, 3, 8, 10, 20, 30, 45, 60] as const;

export const SPECIAL_COURSES = [
  { value: "special-10", days: 10, label: "10 días (especial)" },
  { value: "kids-1", days: 1, label: "Niños (1 día)" },
] as const;

/** Course names for known Vipassana course lengths */
export const COURSE_NAMES: Record<string, string> = {
  "1": "Anapana",
  "3": "curso corto",
  "8": "Sati (Satipaṭṭhāna)",
  "10": "curso estándar",
  "20": "curso de 20 días",
  "30": "curso de 30 días",
  "45": "curso de 45 días",
  "60": "curso de 60 días",
  "special-10": "especial",
  "kids-1": "niños",
};

/** Server-side schema (untranslated) for use in Server Actions */
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

/** Client-side factory returning a translated Zod schema */
export function createCourseFormSchema(t: ReturnType<typeof import("next-intl").useTranslations>) {
  return z
    .object({
      start_date: z.string().min(1, t("labels.startDate")),
      place: z.string().min(1, t("labels.place")),
      teacher: z.string(),
      country: z.string(),
      mode: z.enum(["sit", "serve"]),
      daysPreset: z.string().min(1, t("labels.daysPlaceholder")),
      daysCustom: z.string(),
      obs: z.string(),
    })
    .refine((v) => v.daysPreset !== "other" || (!!v.daysCustom && Number(v.daysCustom) > 0), {
      message: t("labels.daysCustomSit"),
      path: ["daysCustom"],
    });
}

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
  const raw = c.start_date;
  const dateStr =
    typeof raw === "string" ? raw.slice(0, 10) : new Date(raw).toISOString().slice(0, 10);
  return {
    start_date: dateStr,
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
  if (values.daysPreset === "other") return Number(values.daysCustom);
  const special = SPECIAL_COURSES.find((s) => s.value === values.daysPreset);
  if (special) return special.days;
  return Number(values.daysPreset);
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
