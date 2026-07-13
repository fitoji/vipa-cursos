"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Upload, LayoutDashboard } from "lucide-react";

import { createCourse } from "@/app/actions/courses";
import { listCountryNames, listLocationNamesByCountry } from "@/app/actions/locations";
import {
  courseFormSchema,
  type CourseFormValues,
  DAY_PRESETS,
  SPECIAL_COURSES,
  COURSE_NAMES,
  defaultCourseFormValues,
  daysFromFormValues,
} from "@/lib/course-form";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { ImportCoursesDialog } from "@/components/import-courses-dialog";
import { useInView } from "@/lib/animations";
import { useCachedData } from "@/hooks/use-cached-data";
import { cn } from "@/lib/utils";

export function CursosView() {
  const { data: session, isPending } = authClient.useSession();
  const qc = useQueryClient();
  const create = createCourse;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useTranslations("CursosPage") as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tc = useTranslations("common") as any;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: defaultCourseFormValues,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    const id = setTimeout(() => setSubmitted(false), 1500);
    return () => clearTimeout(id);
  }, [submitted]);

  const daysPreset = form.watch("daysPreset");
  const mode = form.watch("mode");
  const isAt = form.watch("isAt");
  const [formRef, formInView] = useInView(0.1);
  const { data: countries } = useCachedData("countries", listCountryNames);
  const selectedCountry = form.watch("country");
  const { data: locations } = useCachedData(
    selectedCountry ? `locations-${selectedCountry}` : "locations-all",
    () => listLocationNamesByCountry(selectedCountry || undefined),
  );

  if (isPending || !session) return null;

  const onSubmit = async (values: CourseFormValues) => {
    const days = daysFromFormValues(values);
    setSubmitting(true);
    try {
      await create({
        data: {
          start_date: values.start_date,
          place: values.place,
          teacher: values.teacher ?? "",
          country: values.country ?? "",
          mode: values.mode,
          is_at: values.isAt,
          days,
          obs: values.obs ?? "",
        },
      });
      toast.success(t("toast.saved"));
      setSubmitted(true);
      form.reset(defaultCourseFormValues);
      await qc.invalidateQueries({ queryKey: ["courses"] });
    } catch (e) {
      console.error(e);
      toast.error(t("toast.saveError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative h-full">
      {/* bosque.webp background */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/bosque.webp')",
          backgroundAttachment: "fixed",
        }}
      />
      {/* overlay for readability */}
      <div className="pointer-events-none absolute inset-0 bg-background/55 backdrop-blur-sm" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <ImportCoursesDialog>
              <Button variant="outline">
                <Upload className="mr-1 h-4 w-4" /> {t("importLink")}
              </Button>
            </ImportCoursesDialog>
            <Button variant="default" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-1 h-4 w-4" /> {t("dashboardLink")}
              </Link>
            </Button>
          </div>
        </header>

        <Card ref={formRef} className={cn(formInView && "anim-fade-up")}>
          <CardHeader>
            <CardTitle>{t("formTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="start_date">{t("labels.startDate")}</Label>
                <DatePicker
                  value={form.watch("start_date")}
                  onChange={(v) => form.setValue("start_date", v)}
                />
                {form.formState.errors.start_date && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.start_date.message}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="place">{t("labels.place")}</Label>
                <Input
                  id="place"
                  list="place-options"
                  placeholder={t("labels.placePlaceholder")}
                  {...form.register("place")}
                />
                <datalist id="place-options">
                  {locations.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
                {form.formState.errors.place && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.place.message}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="teacher">{t("labels.teacher")}</Label>
                <Input
                  id="teacher"
                  placeholder={t("labels.teacherPlaceholder")}
                  {...form.register("teacher")}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="country">{t("labels.country")}</Label>
                <Input
                  id="country"
                  list="country-options"
                  placeholder={t("labels.countryPlaceholder")}
                  {...form.register("country")}
                />
                <datalist id="country-options">
                  {countries.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="grid gap-1.5 sm:col-span-2">
                <Label>{t("labels.mode")}</Label>
                <RadioGroup
                  value={form.watch("mode")}
                  onValueChange={(v) => {
                    const newMode = v as "sit" | "serve";
                    form.setValue("mode", newMode);
                    if (newMode === "sit") form.setValue("isAt", false);
                  }}
                  className="flex gap-6"
                >
                  <label className="flex items-center gap-2">
                    <RadioGroupItem value="sit" id="mode-sit" />
                    <span>{t("labels.sit")}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <RadioGroupItem value="serve" id="mode-serve" />
                    <span>{t("labels.serve")}</span>
                    {mode === "serve" && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <Checkbox
                          id="is_at"
                          checked={isAt}
                          onCheckedChange={(v) => form.setValue("isAt", !!v)}
                        />
                        <Label htmlFor="is_at" className="text-sm">
                          AT
                        </Label>
                      </div>
                    )}
                  </label>
                </RadioGroup>
              </div>

              <div className="grid gap-1.5">
                <Label>{t("labels.days")}</Label>
                <Select
                  value={form.watch("daysPreset")}
                  onValueChange={(v) => form.setValue("daysPreset", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("labels.daysPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_PRESETS.map((d) => {
                      const name = COURSE_NAMES[String(d)];
                      return (
                        <SelectItem key={d} value={String(d)}>
                          {name
                            ? t("days.labelWithName", { days: d, name })
                            : t("days.label", { days: d })}
                        </SelectItem>
                      );
                    })}
                    <SelectSeparator />
                    <SelectItem value="special-10">
                      {t("days.labelWithName", { days: 10, name: "especial" })}
                    </SelectItem>
                    <SelectItem value="kids-1">
                      {t("days.labelWithName", { days: 1, name: "niños" })}
                    </SelectItem>
                    <SelectItem value="other">
                      {mode === "serve" ? t("labels.daysCustomServe") : t("labels.daysCustomSit")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {daysPreset === "other" && (
                <div className="grid gap-1.5">
                  <Label htmlFor="daysCustom">
                    {mode === "serve" ? t("labels.daysCustomServe") : t("labels.daysCustomSit")}
                  </Label>
                  <Input id="daysCustom" type="number" min={1} {...form.register("daysCustom")} />
                  {form.formState.errors.daysCustom && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.daysCustom.message}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="obs">{t("labels.obs")}</Label>
                <Textarea
                  id="obs"
                  placeholder={t("labels.obsPlaceholder")}
                  rows={3}
                  {...form.register("obs")}
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2">
                {submitted && (
                  <span className="anim-scale-in flex items-center gap-1 text-sm text-emerald-600">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("submit.saved")}
                  </span>
                )}
                <Button type="submit" disabled={submitting} className="press-effect">
                  {submitting ? t("submit.saving") : t("submit.save")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
