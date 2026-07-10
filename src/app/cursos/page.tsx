"use client";

import { useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

import { createCourse, listCourses } from "@/app/actions/courses";
import {
  courseFormSchema,
  type CourseFormValues,
  DAY_PRESETS,
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
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { ImportCoursesDialog } from "@/components/import-courses-dialog";

const coursesQuery = queryOptions({
  queryKey: ["courses"],
  queryFn: () => listCourses(),
});

export default function CursosPage() {
  const { data: session, isPending } = authClient.useSession();
  const qc = useQueryClient();
  const { data: courses = [] } = useQuery(coursesQuery);
  const create = createCourse;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: defaultCourseFormValues,
  });

  const [submitting, setSubmitting] = useState(false);
  const daysPreset = form.watch("daysPreset");

  if (isPending) return null;
  if (!session) redirect("/login");

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

        <Card>
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
                <Input id="place" placeholder="Dhamma..." {...form.register("place")} />
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
                <Input id="country" placeholder="ej.: Argentina" {...form.register("country")} />
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
                        {d} días
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

              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Guardando…" : "Guardar curso"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Historial ({courses.length})</h2>
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay cursos registrados.</p>
          ) : (
            <div className="grid gap-3">
              {courses.map((c) => (
                <Card key={c.id}>
                  <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.place}</span>
                        <Badge variant={c.mode === "sit" ? "default" : "secondary"}>{c.mode}</Badge>
                        <Badge variant="outline">{c.days} días</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(c.start_date).toLocaleDateString()}
                        {c.teacher ? ` · ${c.teacher}` : ""}
                        {c.country ? ` · ${c.country}` : ""}
                      </p>
                      {c.obs && <p className="mt-2 text-sm">{c.obs}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
