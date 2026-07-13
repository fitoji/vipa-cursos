"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateCourse } from "@/app/actions/courses";
import { listCountryNames, listLocationNamesByCountry } from "@/app/actions/locations";
import {
  createCourseFormSchema,
  type Course,
  type CourseFormValues,
  DAY_PRESETS,
  SPECIAL_COURSES,
  COURSE_NAMES,
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { useCachedData } from "@/hooks/use-cached-data";
import { staggerDelay } from "@/lib/animations";
import { useTranslations } from "next-intl";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useTranslations("Dashboard.edit") as any;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(createCourseFormSchema(t)),
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
  const mode = form.watch("mode");
  const isAt = form.watch("isAt");

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
          is_at: values.isAt,
          days,
          obs: values.obs,
        },
      });
      toast.success(t("success"));
      await qc.invalidateQueries({ queryKey: ["courses"] });
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5 anim-fade-up" style={staggerDelay(0)}>
            <Label htmlFor="e_start">{t("labels.date")}</Label>
            <DatePicker
              value={form.watch("start_date")}
              onChange={(v) => form.setValue("start_date", v)}
            />
          </div>
          <div className="grid gap-1.5 anim-fade-up" style={staggerDelay(1)}>
            <Label htmlFor="e_place">{t("labels.place")}</Label>
            <Input id="e_place" list="e_place-options" {...form.register("place")} />
            <datalist id="e_place-options">
              {locations.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </div>
          <div className="grid gap-1.5 anim-fade-up" style={staggerDelay(2)}>
            <Label htmlFor="e_teacher">{t("labels.teacher")}</Label>
            <Input id="e_teacher" {...form.register("teacher")} />
          </div>
          <div className="grid gap-1.5 anim-fade-up" style={staggerDelay(3)}>
            <Label htmlFor="e_country">{t("labels.country")}</Label>
            <Input id="e_country" list="e_country-options" {...form.register("country")} />
            <datalist id="e_country-options">
              {countries.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="grid gap-1.5 sm:col-span-2 anim-fade-up" style={staggerDelay(4)}>
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
                <RadioGroupItem value="sit" id="e_sit" />
                <span>{t("labels.sit")}</span>
              </label>
              <label className="flex items-center gap-2">
                <RadioGroupItem value="serve" id="e_serve" />
                <span>{t("labels.serve")}</span>
                {mode === "serve" && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <Checkbox
                      id="e_is_at"
                      checked={isAt}
                      onCheckedChange={(v) => form.setValue("isAt", !!v)}
                    />
                    <Label htmlFor="e_is_at" className="text-sm">
                      AT
                    </Label>
                  </div>
                )}
              </label>
            </RadioGroup>
          </div>
          <div className="grid gap-1.5 anim-fade-up" style={staggerDelay(5)}>
            <Label>{t("labels.days")}</Label>
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
                    {t("labels.daysLabel", { days: d })}
                    {COURSE_NAMES[String(d)] ? ` — ${COURSE_NAMES[String(d)]}` : ""}
                  </SelectItem>
                ))}
                <SelectSeparator />
                {SPECIAL_COURSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
                <SelectItem value="other">
                  {mode === "serve" ? t("labels.daysCustomServe") : t("labels.daysCustomSit")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {daysPreset === "other" && (
            <div className="grid gap-1.5 anim-fade-up" style={staggerDelay(6)}>
              <Label htmlFor="e_custom">
                {mode === "serve" ? t("labels.daysCustomServe") : t("labels.daysCustomSit")}
              </Label>
              <Input id="e_custom" type="number" min={1} {...form.register("daysCustom")} />
            </div>
          )}
          <div className="grid gap-1.5 sm:col-span-2 anim-fade-up" style={staggerDelay(7)}>
            <Label htmlFor="e_obs">{t("labels.obs")}</Label>
            <Textarea id="e_obs" rows={3} {...form.register("obs")} />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={saving} className="press-effect">
              {saving ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
