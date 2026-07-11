import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateCourse } from "@/app/actions/courses";
import { listCountryNames, listLocationNamesByCountry } from "@/app/actions/locations";
import {
  courseFormSchema,
  type Course,
  type CourseFormValues,
  DAY_PRESETS,
  defaultCourseFormValues,
  daysFromFormValues,
  toFormValues,
} from "@/lib/course-form";
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
import { DatePicker } from "@/components/ui/date-picker";
import { useCachedData } from "@/hooks/use-cached-data";
import { staggerDelay } from "@/lib/animations";

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

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: course ? toFormValues(course) : defaultCourseFormValues,
  });

  const { data: countries } = useCachedData("countries", listCountryNames);
  const selectedCountry = form.watch("country");
  const { data: locations } = useCachedData(
    selectedCountry ? `locations-${selectedCountry}` : "locations-all",
    () => listLocationNamesByCountry(selectedCountry || undefined),
  );

  useEffect(() => {
    if (course) form.reset(toFormValues(course));
  }, [course, form]);

  const daysPreset = form.watch("daysPreset");

  const onSubmit = async (values: CourseFormValues) => {
    if (!course) return;
    const days = daysFromFormValues(values);
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
          <div className="grid gap-1.5 anim-fade-up" style={staggerDelay(0)}>
            <Label htmlFor="e_start">Fecha</Label>
            <DatePicker
              value={form.watch("start_date")}
              onChange={(v) => form.setValue("start_date", v)}
            />
          </div>
          <div className="grid gap-1.5 anim-fade-up" style={staggerDelay(1)}>
            <Label htmlFor="e_place">Lugar</Label>
            <Input id="e_place" list="e_place-options" {...form.register("place")} />
            <datalist id="e_place-options">
              {locations.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </div>
          <div className="grid gap-1.5 anim-fade-up" style={staggerDelay(2)}>
            <Label htmlFor="e_teacher">Profesor</Label>
            <Input id="e_teacher" {...form.register("teacher")} />
          </div>
          <div className="grid gap-1.5 anim-fade-up" style={staggerDelay(3)}>
            <Label htmlFor="e_country">País</Label>
            <Input id="e_country" list="e_country-options" {...form.register("country")} />
            <datalist id="e_country-options">
              {countries.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="grid gap-1.5 sm:col-span-2 anim-fade-up" style={staggerDelay(4)}>
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
          <div className="grid gap-1.5 anim-fade-up" style={staggerDelay(5)}>
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
            <div className="grid gap-1.5 anim-fade-up" style={staggerDelay(6)}>
              <Label htmlFor="e_custom">Días (personalizado)</Label>
              <Input id="e_custom" type="number" min={1} {...form.register("daysCustom")} />
            </div>
          )}
          <div className="grid gap-1.5 sm:col-span-2 anim-fade-up" style={staggerDelay(7)}>
            <Label htmlFor="e_obs">Observaciones</Label>
            <Textarea id="e_obs" rows={3} {...form.register("obs")} />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="press-effect">
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
