"use client";

import { Check, Flame, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { listStreaks, createStreak, deleteStreak, updateStreak } from "@/app/actions/streaks";

type Streak = {
  id: number;
  user_id: string;
  start_date: string | Date;
  end_date: string | Date;
  is_active: boolean;
  created_at: string | Date;
};

type FormValues = {
  start_date: string;
  end_date: string;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

function toDateStr(d: string | Date): string {
  if (typeof d === "string") return d.split("T")[0];
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string | Date, b: string | Date) {
  const aStr = toDateStr(a);
  const bStr = toDateStr(b);
  return Math.floor((new Date(bStr).getTime() - new Date(aStr).getTime()) / 86_400_000) + 1;
}

const streaksQuery = queryOptions({
  queryKey: ["streaks"],
  queryFn: () => listStreaks(),
  staleTime: 30_000,
});

export default function MeditationStreakTracker() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Streak | null>(null);
  const qc = useQueryClient();

  const { data: streaks = [], isLoading } = useQuery(streaksQuery);

  const locale = useLocale();
  const t = useTranslations("Racha");
  const tStats = useTranslations("Racha.stats");
  const tForm = useTranslations("Racha.form");
  const tSection = useTranslations("Racha.section");
  const tEmpty = useTranslations("Racha.empty");
  const tStreak = useTranslations("Racha.streak");
  const tSidebar = useTranslations("Dashboard.sidebar");
  const { backgroundImage } = useBackground();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { start_date: todayStr(), end_date: todayStr() },
  });

  const startDate = watch("start_date");
  const endDate = watch("end_date");
  const isActive = endDate === todayStr();

  const formatDate = (d: string | Date) => {
    const dateStr = toDateStr(d);
    return new Date(dateStr + "T12:00:00").toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createStreak({ data: values });
      await qc.invalidateQueries({ queryKey: ["streaks"] });
      reset({ start_date: todayStr(), end_date: todayStr() });
      setShowForm(false);
    } catch {
      toast.error("Error al guardar la racha");
    }
  };

  const openNewForm = () => {
    reset({ start_date: todayStr(), end_date: todayStr() });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteStreak({ data: { id } });
      await qc.invalidateQueries({ queryKey: ["streaks"] });
    } catch {
      toast.error("Error al eliminar la racha");
    }
  };

  const handleEdit = async (values: FormValues) => {
    if (!editing) return;
    try {
      await updateStreak({ data: { id: editing.id, ...values } });
      await qc.invalidateQueries({ queryKey: ["streaks"] });
      setEditing(null);
      toast.success(tStreak("updated"));
    } catch {
      toast.error("Error al actualizar la racha");
    }
  };

  const activeStreaks = streaks.filter((s) => s.is_active);
  const finishedStreaks = streaks.filter((s) => !s.is_active);

  const currentDays =
    activeStreaks.length > 0
      ? daysBetween(activeStreaks[0].start_date, activeStreaks[0].end_date)
      : 0;
  const bestDays =
    streaks.length > 0 ? Math.max(...streaks.map((s) => daysBetween(s.start_date, s.end_date))) : 0;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="relative h-full">
          <BackgroundLayer imageKey={backgroundImage} />

          <div className="relative z-10 mx-auto max-w-3xl px-4 py-10">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger aria-label={tSidebar("toggleSidebar")} />
                <div>
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                    <Flame className="h-5 w-5 text-primary" />
                  </div>
                  <h1 className="font-serif text-3xl font-semibold tracking-tight">
                    {t("header.title")}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">{t("header.description")}</p>
                </div>
              </div>
            </div>

            {/* Summary cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{tStats("current")}</CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums text-primary">
                    {tStats("days", { count: currentDays })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{tStats("best")}</CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">
                    {tStats("days", { count: bestDays })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{tStats("total")}</CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{streaks.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* New streak form */}
            {showForm ? (
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-medium">{tForm("newStreak")}</h2>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowForm(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="start_date" className="mb-1.5">
                          {tForm("startDate")}
                        </Label>
                        <DatePicker
                          value={watch("start_date")}
                          onChange={(v) => {
                            setValue("start_date", v, { shouldValidate: true });
                          }}
                        />
                        {errors.start_date && (
                          <p className="mt-1 text-xs text-destructive">
                            {errors.start_date.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="end_date" className="mb-1.5">
                          {tForm("endDate")}
                        </Label>
                        <DatePicker
                          value={watch("end_date")}
                          onChange={(v) => {
                            setValue("end_date", v, { shouldValidate: true });
                          }}
                        />
                        {errors.end_date && (
                          <p className="mt-1 text-xs text-destructive">{errors.end_date.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                      {isActive ? (
                        <Badge variant="default" className="gap-1.5">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" />
                          {tForm("activeToday")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1.5">
                          <Check className="h-3.5 w-3.5" />
                          {tForm("finished")}
                        </Badge>
                      )}
                      <span className="text-muted-foreground">
                        {tForm("duration", { count: daysBetween(startDate, endDate) })}
                      </span>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        {tForm("cancel")}
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        <Check className="mr-2 h-4 w-4" />
                        {tForm("save")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="outline"
                onClick={openNewForm}
                className="mb-8 w-full justify-center gap-2 border-dashed py-6"
              >
                <Plus className="h-5 w-5" />
                {tForm("addButton")}
              </Button>
            )}

            {/* Active streaks */}
            <Section title={tSection("active")} count={activeStreaks.length}>
              {activeStreaks.length === 0 ? (
                <Empty text={tEmpty("active")} />
              ) : (
                activeStreaks.map((s) => (
                  <StreakRow
                    key={s.id}
                    streak={s}
                    onEdit={setEditing}
                    onDelete={handleDelete}
                    formatDate={formatDate}
                    tStreak={tStreak}
                  />
                ))
              )}
            </Section>

            {/* Finished streaks */}
            <Section title={tSection("finished")} count={finishedStreaks.length}>
              {finishedStreaks.length === 0 ? (
                <Empty text={tEmpty("finished")} />
              ) : (
                finishedStreaks.map((s) => (
                  <StreakRow
                    key={s.id}
                    streak={s}
                    onEdit={setEditing}
                    onDelete={handleDelete}
                    formatDate={formatDate}
                    tStreak={tStreak}
                  />
                ))
              )}
            </Section>
          </div>
        </div>
      </SidebarInset>

      {/* Edit streak dialog */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{tStreak("edit")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <EditStreakForm
              streak={editing}
              onSubmit={handleEdit}
              onCancel={() => setEditing(null)}
              tForm={tForm}
            />
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

/* ---------- Helper components ---------- */

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <Badge variant="secondary">{count}</Badge>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function StreakRow({
  streak,
  onEdit,
  onDelete,
  formatDate,
  tStreak,
}: {
  streak: Streak;
  onEdit: (streak: Streak) => void;
  onDelete: (id: number) => void;
  formatDate: (d: string | Date) => string;
  tStreak: ReturnType<typeof useTranslations<"Racha.streak">>;
}) {
  const days = daysBetween(streak.start_date, streak.end_date);
  return (
    <div
      className={cn(
        "group flex items-center justify-between rounded-xl border p-4 transition",
        "bg-card hover:bg-accent/50",
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            streak.is_active
              ? "bg-primary/10 text-primary ring-1 ring-primary/20"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {formatDate(streak.start_date)} → {formatDate(streak.end_date)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {days} {days !== 1 ? tStreak("days") : tStreak("day")}
            {streak.is_active && (
              <span className="ml-2 inline-flex items-center gap-1 text-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                {tStreak("active")}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(streak)}
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:text-foreground"
          aria-label={tStreak("edit")}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(streak.id)}
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:text-destructive"
          aria-label={tStreak("delete")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function EditStreakForm({
  streak,
  onSubmit,
  onCancel,
  tForm,
}: {
  streak: Streak;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  tForm: ReturnType<typeof useTranslations<"Racha.form">>;
}) {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      start_date: toDateStr(streak.start_date),
      end_date: toDateStr(streak.end_date),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>{tForm("startDate")}</Label>
        <DatePicker
          value={watch("start_date")}
          onChange={(v) => v && setValue("start_date", v, { shouldValidate: true })}
        />
      </div>
      <div className="space-y-2">
        <Label>{tForm("endDate")}</Label>
        <DatePicker
          value={watch("end_date")}
          onChange={(v) => v && setValue("end_date", v, { shouldValidate: true })}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {tForm("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {tForm("save")}
        </Button>
      </DialogFooter>
    </form>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
