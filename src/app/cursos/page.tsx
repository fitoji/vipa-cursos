"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { createCourse } from "@/app/actions/courses";
import { listCountryNames, listLocationNamesByCountry } from "@/app/actions/locations";
import {
  courseFormSchema,
  type CourseFormValues,
  DAY_PRESETS,
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from "@/components/ui/date-picker";
import { ImportCoursesDialog } from "@/components/import-courses-dialog";
import { useInView } from "@/lib/animations";
import { useCachedData } from "@/hooks/use-cached-data";
import { cn } from "@/lib/utils";

export default function CursosPage() {
  const { data: session, isPending } = authClient.useSession();
  const qc = useQueryClient();
  const create = createCourse;

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
          days,
          obs: values.obs ?? "",
        },
      });
      toast.success("Curso guardado");
      setSubmitted(true);
      form.reset(defaultCourseFormValues);
      await qc.invalidateQueries({ queryKey: ["courses"] });
    } catch (e) {
      console.error(e);
      toast.error("No se pudo guardar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Mis cursos de Vipassana</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Guarda tus cursos sentados y servicios en un solo lugar.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Panel de Control</Link>
          </Button>
          <ImportCoursesDialog />
        </header>

        <Card ref={formRef} className={cn(formInView && "anim-fade-up")}>
          <CardHeader>
            <CardTitle>Nuevo curso</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="start_date">Fecha de inicio</Label>
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
                <Label htmlFor="place">Lugar / Centro</Label>
                <Input
                  id="place"
                  list="place-options"
                  placeholder="Dhamma..."
                  {...form.register("place")}
                />
                <datalist id="place-options">
                  {locations.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
                {form.formState.errors.place && (
                  <p className="text-xs text-destructive">{form.formState.errors.place.message}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="teacher">Profesor/a</Label>
                <Input id="teacher" placeholder="ej.: S.N.Goenka" {...form.register("teacher")} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  list="country-options"
                  placeholder="ej.: Argentina"
                  {...form.register("country")}
                />
                <datalist id="country-options">
                  {countries.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="grid gap-1.5 sm:col-span-2">
                <Label>Modo</Label>
                <RadioGroup
                  value={form.watch("mode")}
                  onValueChange={(v) => form.setValue("mode", v as "sit" | "serve")}
                  className="flex gap-6"
                >
                  <label className="flex items-center gap-2">
                    <RadioGroupItem value="sit" id="mode-sit" />
                    <span>Sentar</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <RadioGroupItem value="serve" id="mode-serve" />
                    <span>Servir</span>
                  </label>
                </RadioGroup>
              </div>

              <div className="grid gap-1.5">
                <Label>Días</Label>
                <Select
                  value={form.watch("daysPreset")}
                  onValueChange={(v) => form.setValue("daysPreset", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_PRESETS.map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d} días{COURSE_NAMES[d] ? ` — ${COURSE_NAMES[d]}` : ""}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Otro…</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {daysPreset === "other" && (
                <div className="grid gap-1.5">
                  <Label htmlFor="daysCustom">Días (personalizado)</Label>
                  <Input id="daysCustom" type="number" min={1} {...form.register("daysCustom")} />
                  {form.formState.errors.daysCustom && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.daysCustom.message}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="obs">Observaciones</Label>
                <Textarea
                  id="obs"
                  placeholder="Agrega información adicional..."
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
                    Guardado
                  </span>
                )}
                <Button type="submit" disabled={submitting} className="press-effect">
                  {submitting ? "Guardando…" : "Guardar curso"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
