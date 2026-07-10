"use client";

import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { createCourse, listCourses } from "@/app/actions/courses";
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

const coursesQuery = queryOptions({
  queryKey: ["courses"],
  queryFn: () => listCourses(),
});

const DAY_PRESETS = [1, 3, 10, 20, 30, 45, 60] as const;

const formSchema = z
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

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const qc = useQueryClient();
  const { data: courses = [] } = useQuery(coursesQuery);
  const create = createCourse;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start_date: "",
      place: "",
      teacher: "",
      country: "",
      mode: "sit",
      daysPreset: "10",
      daysCustom: "",
      obs: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const daysPreset = form.watch("daysPreset");

  const onSubmit = async (values: FormValues) => {
    const days =
      values.daysPreset === "other" ? Number(values.daysCustom) : Number(values.daysPreset);
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
      form.reset({
        start_date: "",
        place: "",
        teacher: "",
        country: "",
        mode: "sit",
        daysPreset: "10",
        daysCustom: "",
        obs: "",
      });
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
              Guarda tus sits y servicios en un solo lugar.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Ver dashboard</Link>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo curso</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="start_date">Fecha de inicio</Label>
                <Input id="start_date" type="date" {...form.register("start_date")} />
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
                <Input id="teacher" {...form.register("teacher")} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="country">País</Label>
                <Input id="country" {...form.register("country")} />
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
                    <span>Sit</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <RadioGroupItem value="serve" id="mode-serve" />
                    <span>Serve</span>
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
                <Textarea id="obs" rows={3} {...form.register("obs")} />
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
