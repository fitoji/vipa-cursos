import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateCourse, listCourses } from "@/app/actions/courses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Course = Awaited<ReturnType<typeof listCourses>>[number];

const DAY_PRESETS = [1, 3, 10, 20, 30, 45, 60] as const;

const schema = z
  .object({
    start_date: z.string().min(1, "Requerido"),
    place: z.string().min(1, "Requerido"),
    teacher: z.string(),
    country: z.string(),
    mode: z.enum(["sit", "serve"]),
    daysPreset: z.string().min(1),
    daysCustom: z.string(),
    obs: z.string(),
  })
  .refine((v) => v.daysPreset !== "other" || (!!v.daysCustom && Number(v.daysCustom) > 0), {
    message: "Ingresa la cantidad de días",
    path: ["daysCustom"],
  });

type FormValues = z.infer<typeof schema>;

function toFormValues(c: Course): FormValues {
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

export function EditCourseDialog({
  course,
  open,
  onOpenChange,
}: {
  course: Course | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const update = updateCourse;
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: course
      ? toFormValues(course)
      : {
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

  useEffect(() => {
    if (course) form.reset(toFormValues(course));
  }, [course, form]);

  const daysPreset = form.watch("daysPreset");

  const onSubmit = async (values: FormValues) => {
    if (!course) return;
    const days =
      values.daysPreset === "other" ? Number(values.daysCustom) : Number(values.daysPreset);
    setSaving(true);
    try {
      await update({
        data: {
          id: course.id,
          start_date: values.start_date,
          place: values.place,
          teacher: values.teacher,
          country: values.country,
          mode: values.mode,
          days,
          obs: values.obs,
        },
      });
      toast.success("Curso actualizado");
      await qc.invalidateQueries({ queryKey: ["courses"] });
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("No se pudo actualizar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar curso</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="e_start">Fecha</Label>
            <Input id="e_start" type="date" {...form.register("start_date")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="e_place">Lugar</Label>
            <Input id="e_place" {...form.register("place")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="e_teacher">Profesor</Label>
            <Input id="e_teacher" {...form.register("teacher")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="e_country">País</Label>
            <Input id="e_country" {...form.register("country")} />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Modo</Label>
            <RadioGroup
              value={form.watch("mode")}
              onValueChange={(v) => form.setValue("mode", v as "sit" | "serve")}
              className="flex gap-6"
            >
              <label className="flex items-center gap-2">
                <RadioGroupItem value="sit" id="e_sit" />
                <span>Sit</span>
              </label>
              <label className="flex items-center gap-2">
                <RadioGroupItem value="serve" id="e_serve" />
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
                <SelectValue />
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
              <Label htmlFor="e_custom">Días (personalizado)</Label>
              <Input id="e_custom" type="number" min={1} {...form.register("daysCustom")} />
            </div>
          )}
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="e_obs">Observaciones</Label>
            <Textarea id="e_obs" rows={3} {...form.register("obs")} />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
