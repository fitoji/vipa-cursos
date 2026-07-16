"use client";

import { useMemo } from "react";
import {
  Calendar,
  MapPin,
  User,
  Globe,
  Clock,
  BookOpen,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { listCourses } from "@/app/actions/courses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";

type Course = Awaited<ReturnType<typeof listCourses>>[number];

export function CourseDetailDialog({
  course,
  courses,
  open,
  onOpenChange,
}: {
  course: Course | null;
  courses: Course[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("Dashboard.detail");

  const { previousCourse, nextCourse } = useMemo(() => {
    if (!course || courses.length === 0) {
      return { previousCourse: null, nextCourse: null };
    }

    const sorted = [...courses].sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
    );
    const idx = sorted.findIndex((c) => c.id === course.id);
    if (idx === -1) return { previousCourse: null, nextCourse: null };

    return {
      previousCourse: idx > 0 ? sorted[idx - 1] : null,
      nextCourse: idx < sorted.length - 1 ? sorted[idx + 1] : null,
    };
  }, [course, courses]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            {course?.place}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {course && (
              <>
                <Badge variant={course.mode === "sit" ? "default" : "secondary"}>
                  {t(course.mode as "sit" | "serve")}
                </Badge>
                {course.is_at && (
                  <Badge variant="outline" className="text-xs">
                    AT
                  </Badge>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {course && (
          <div className="flex flex-col gap-4">
            {/* Fields grid */}
            <div className="grid gap-3 text-sm">
              <Row icon={<Calendar className="size-4 shrink-0" />} label={t("startDate")}>
                {formatDate(course.start_date, locale)}
              </Row>
              <Row icon={<MapPin className="size-4 shrink-0" />} label={t("place")}>
                {course.place}
              </Row>
              <Row icon={<User className="size-4 shrink-0" />} label={t("teacher")}>
                {course.teacher || "—"}
              </Row>
              <Row icon={<Globe className="size-4 shrink-0" />} label={t("country")}>
                {course.country || "—"}
              </Row>
              <Row icon={<BookOpen className="size-4 shrink-0" />} label={t("mode")}>
                <Badge variant={course.mode === "sit" ? "default" : "secondary"}>
                  {t(course.mode as "sit" | "serve")}
                </Badge>
                {course.is_at && (
                  <Badge variant="outline" className="text-xs">
                    {t("at")}
                  </Badge>
                )}
              </Row>
              <Row icon={<Clock className="size-4 shrink-0" />} label={t("days")}>
                {course.days}
              </Row>
              {course.obs && (
                <Row icon={<MessageSquare className="size-4 shrink-0" />} label={t("notes")}>
                  {course.obs}
                </Row>
              )}
            </div>

            {/* Temporal context */}
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <ArrowLeft className="size-3" />
                  {t("previousCourse")}
                </span>
                {previousCourse ? (
                  <div className="rounded-md border bg-muted/30 p-2">
                    <p className="font-medium leading-tight">{previousCourse.place}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(previousCourse.start_date, locale)} · {previousCourse.days}d
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">{t("noPrevious")}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <ArrowRight className="size-3" />
                  {t("nextCourse")}
                </span>
                {nextCourse ? (
                  <div className="rounded-md border bg-muted/30 p-2">
                    <p className="font-medium leading-tight">{nextCourse.place}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(nextCourse.start_date, locale)} · {nextCourse.days}d
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">{t("noNext")}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span>{children}</span>
      </div>
    </div>
  );
}
