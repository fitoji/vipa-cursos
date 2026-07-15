"use client";

import { useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { TransitionLink as Link } from "@/components/transition-link";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import {
  Search,
  ArrowUpDown,
  Pencil,
  Plus,
  Trash2,
  Calendar,
  Flame,
  Globe,
  Clock,
  Users,
  BookOpen,
  FileText,
  Upload,
  Hourglass,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

import { listCourses, deleteCourse } from "@/app/actions/courses";
import { listStreaks } from "@/app/actions/streaks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { EditCourseDialog } from "@/components/edit-course-dialog";
import { CourseDetailDialog } from "@/components/course-detail-dialog";
import { ImportCoursesPanel } from "@/components/import-courses-panel";
import { LocationsExplorer } from "@/components/locations-explorer";
import { AppSidebar } from "@/components/app-sidebar";
import { BackgroundLayer } from "@/components/background-layer";
import { useBackground } from "@/hooks/useBackground";
import { formatDate } from "@/lib/format";
import { useCountUp } from "@/lib/animations";

type Course = Awaited<ReturnType<typeof listCourses>>[number];
type View = "stats" | "courses" | "locations" | "import";

type FilterPreset = {
  label: string;
  filter: (c: Course) => boolean;
} | null;

function toDateStr(d: string | Date): string {
  if (typeof d === "string") return d.split("T")[0];
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string | Date, b: string | Date) {
  const aStr = toDateStr(a);
  const bStr = toDateStr(b);
  return Math.floor((new Date(bStr).getTime() - new Date(aStr).getTime()) / 86_400_000) + 1;
}

const coursesQuery = queryOptions({
  queryKey: ["courses"],
  queryFn: () => listCourses(),
  staleTime: 30_000,
});

const streaksQuery = queryOptions({
  queryKey: ["streaks"],
  queryFn: () => listStreaks(),
  staleTime: 30_000,
});

const columnHelper = createColumnHelper<Course>();

export function DashboardView() {
  const { data: courses = [], isLoading } = useQuery(coursesQuery);
  const { data: streaks = [] } = useQuery(streaksQuery);
  const qc = useQueryClient();
  const del = deleteCourse;
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "start_date", desc: true }]);
  const [editing, setEditing] = useState<Course | null>(null);
  const [viewing, setViewing] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const [view, setViewState] = useState<View>("stats");
  const [filterPreset, setFilterPreset] = useState<FilterPreset>(null);
  const { backgroundImage } = useBackground();

  const locale = useLocale();
  const t = useTranslations("Dashboard");
  const ts = useTranslations("Dashboard.stats");
  const tt = useTranslations("Dashboard.table");
  const ttoast = useTranslations("Dashboard.toast");
  const tedit = useTranslations("Dashboard.edit");
  const tfilters = useTranslations("Dashboard.filters");
  const tsidebar = useTranslations("Dashboard.sidebar");

  const navigate = (v: View, filter?: FilterPreset) => {
    if (filter) setFilterPreset(filter);
    else setFilterPreset(null);
    if (v === view) return;
    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(() => setViewState(v));
    } else {
      setViewState(v);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setBusyDelete(true);
    try {
      await del({ data: { id: deleting.id } });
      toast.success(ttoast("deleted"));
      await qc.invalidateQueries({ queryKey: ["courses"] });
      setDeleting(null);
    } catch (e) {
      console.error(e);
      toast.error(ttoast("deleteError"));
    } finally {
      setBusyDelete(false);
    }
  };

  // --- Stats ---
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const totalDaysSit = courses
      .filter((c) => c.mode === "sit")
      .reduce((sum, c) => sum + (c.days ?? 0), 0);
    const totalDaysServe = courses
      .filter((c) => c.mode === "serve")
      .reduce((sum, c) => sum + (c.days ?? 0), 0);
    const countries = new Set(courses.flatMap((c) => (c.country ? [c.country] : []))).size;
    const sitCount = courses.filter((c) => c.mode === "sit").length;
    const serveCount = courses.filter((c) => c.mode === "serve").length;
    const sit10 = courses.filter((c) => c.mode === "sit" && c.days === 10).length;
    const serve10 = courses.filter((c) => c.mode === "serve" && c.days === 10).length;
    const longServe = courses.filter((c) => c.mode === "serve" && (c.days ?? 0) >= 20).length;
    const longCourses = courses.filter((c) => (c.days ?? 0) >= 20).length;
    const atCourses = courses.filter((c) => c.is_at && c.mode === "serve");
    const firstAtYear = atCourses.length
      ? Math.min(...atCourses.map((c) => new Date(c.start_date).getFullYear()))
      : 0;
    const yearsAT = firstAtYear ? new Date().getFullYear() - firstAtYear : 0;
    const recentCourses = [...courses]
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
      .slice(0, 5);
    const firstYear = courses.length
      ? Math.min(...courses.map((c) => new Date(c.start_date).getFullYear()))
      : new Date().getFullYear();
    const yearsMeditating = courses.length ? new Date().getFullYear() - firstYear : 0;

    const activeStreaks = streaks.filter((s) => s.is_active);
    const activeStreak =
      activeStreaks.length > 0
        ? activeStreaks.reduce((longest, s) => {
            const longestDays = daysBetween(longest.start_date, longest.end_date);
            const sDays = daysBetween(s.start_date, s.end_date);
            return sDays > longestDays ? s : longest;
          })
        : null;
    const activeStreakDays = activeStreak
      ? daysBetween(activeStreak.start_date, activeStreak.end_date)
      : 0;

    return {
      totalCourses,
      totalDaysSit,
      totalDaysServe,
      countries,
      sitCount,
      serveCount,
      sit10,
      serve10,
      longServe,
      longCourses,
      yearsMeditating,
      yearsAT,
      recentCourses,
      activeStreak,
      activeStreakDays,
    };
  }, [courses, streaks]);

  // --- Table ---
  const columns = useMemo(
    () => [
      columnHelper.accessor("start_date", {
        header: tt("header.date"),
        cell: (i) => formatDate(i.getValue(), locale),
      }),
      columnHelper.accessor("place", { header: tt("header.place") }),
      columnHelper.accessor("teacher", {
        header: tt("header.teacher"),
        cell: (i) => i.getValue() || tt("notSpecified"),
      }),
      columnHelper.accessor("country", {
        header: tt("header.country"),
        cell: (i) => i.getValue() || tt("notSpecified"),
      }),
      columnHelper.accessor("mode", {
        header: tt("header.mode"),
        cell: (i) => (
          <div className="flex items-center gap-1">
            <Badge variant={i.getValue() === "sit" ? "default" : "secondary"}>
              {tt(i.getValue())}
            </Badge>
            {i.row.original.is_at && (
              <Badge variant="outline" className="text-xs">
                AT
              </Badge>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("days", {
        header: tt("header.days"),
        cell: (i) => <Badge variant="outline">{tt("daysLabel", { days: i.getValue() })}</Badge>,
      }),
      columnHelper.accessor("obs", {
        header: tt("header.obs"),
        cell: (i) => (
          <span className="line-clamp-2 text-sm text-muted-foreground">
            {i.getValue() || tt("notSpecified")}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">{tt("header.actions")}</span>,
        cell: (i) => (
          <div className="flex justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setEditing(i.row.original)}
              aria-label={tt("edit")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setDeleting(i.row.original)}
              aria-label={tt("delete")}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [locale],
  );

  const filteredCourses = filterPreset ? courses.filter(filterPreset.filter) : courses;

  const table = useReactTable({
    data: filteredCourses,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  });

  return (
    <SidebarProvider>
      <AppSidebar activeView={view} onNavigate={navigate} />
      <SidebarInset>
        <div className="relative h-full">
          <BackgroundLayer imageKey={backgroundImage} />

          <div className="relative z-10 mx-auto max-w-6xl px-4 py-10">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger aria-label={tsidebar("toggleSidebar")} />
                <div>
                  <h1 className="font-serif text-3xl font-semibold tracking-tight">
                    {t("header.title")}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("header.coursesCount", { count: courses.length })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" asChild>
                  <Link href="/cursos">
                    <Plus className="mr-1 h-4 w-4" /> {t("header.newCourse")}
                  </Link>
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-8" role="status" aria-busy="true">
                <span className="sr-only">{t("loading")}</span>

                {/* Stat cards skeleton */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4 rounded" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Secondary metrics skeleton */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border bg-card/50 px-5 py-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-6 w-10" />
                    </div>
                  ))}
                </div>

                {/* Mode breakdown skeleton */}
                <Card>
                  <CardHeader>
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-12 rounded-md" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex-1">
                        <Skeleton className="h-2 w-full rounded-full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-16 rounded-md" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent courses skeleton */}
                <Card>
                  <CardHeader>
                    <Skeleton className="h-4 w-36" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4 rounded" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-48" />
                            </div>
                          </div>
                          <Skeleton className="h-5 w-14 rounded-md" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : view === "stats" ? (
              <StatsView
                {...stats}
                courses={courses}
                onFilterClick={(preset) => navigate("courses", preset)}
              />
            ) : view === "courses" ? (
              <CoursesTableView
                table={table}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                filterPreset={filterPreset}
                onClearFilter={() => setFilterPreset(null)}
                onView={setViewing}
              />
            ) : view === "locations" ? (
              <LocationsExplorer />
            ) : (
              <ImportCoursesPanel onImported={() => navigate("courses")} />
            )}
          </div>
        </div>

        <EditCourseDialog
          course={editing}
          open={!!editing}
          onOpenChange={(v) => !v && setEditing(null)}
        />

        <CourseDetailDialog
          course={viewing}
          courses={courses}
          open={!!viewing}
          onOpenChange={(v) => !v && setViewing(null)}
        />

        <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{tt("deleteDialog.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {deleting
                  ? tt("deleteDialog.description", {
                      place: deleting.place,
                      days: deleting.days,
                      mode: deleting.mode,
                    })
                  : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={busyDelete}>
                {tt("deleteDialog.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={busyDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {busyDelete ? tt("deleteDialog.deleting") : tt("deleteDialog.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  );
}

// -- EmptyState --
function EmptyState() {
  const [copied, setCopied] = useState(false);

  const t = useTranslations("Dashboard.empty");
  const tc = useTranslations("common");

  const promptText = `Convierte estos datos de cursos de Vipassana al siguiente formato JSON:
[{"date":"YYYY-MM-DD","type":"sit","country":"...","location":"...","notes":"..."}]
mis datos son: [PEGAR AQUÍ]`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("description")}</p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/cursos">
                <Upload className="mr-2 h-4 w-4" /> {t("addCourse")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" />
            {t("excelTip")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("excelTipDesc")}</p>
          <div className="relative rounded-lg border bg-muted/50 p-4 font-mono text-xs">
            <pre className="whitespace-pre-wrap">{promptText}</pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-2"
              onClick={handleCopy}
            >
              {copied ? (
                <span className="text-xs text-emerald-600">{tc("copied")}</span>
              ) : (
                <span className="text-xs">{tc("copy")}</span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// -- StatsView --
function StatsView({
  totalCourses,
  totalDaysSit,
  totalDaysServe,
  countries,
  sitCount,
  serveCount,
  sit10,
  serve10,
  longServe,
  longCourses,
  yearsMeditating,
  yearsAT,
  recentCourses,
  courses,
  activeStreak,
  activeStreakDays,
  onFilterClick,
}: {
  totalCourses: number;
  totalDaysSit: number;
  totalDaysServe: number;
  countries: number;
  sitCount: number;
  serveCount: number;
  sit10: number;
  serve10: number;
  longServe: number;
  longCourses: number;
  yearsMeditating: number;
  yearsAT: number;
  recentCourses: Course[];
  courses: Course[];
  activeStreak: { id: number; start_date: string | Date; end_date: string | Date } | null;
  activeStreakDays: number;
  onFilterClick: (preset: FilterPreset) => void;
}) {
  const [showCountries, setShowCountries] = useState(false);

  const t = useTranslations("Dashboard.stats");
  const ts = useTranslations("Dashboard.stats");
  const tt = useTranslations("Dashboard.table");
  const tfilters = useTranslations("Dashboard.filters");
  const tempty = useTranslations("Dashboard.empty");
  const trecent = useTranslations("Dashboard.recent");

  const uniqueCountries = [...new Set(courses.flatMap((c) => (c.country ? [c.country] : [])))]
    .filter(Boolean)
    .sort();

  const animTotalCourses = useCountUp(totalCourses, 800, true);
  const animTotalDaysSit = useCountUp(totalDaysSit, 800, true);
  const animTotalDaysServe = useCountUp(totalDaysServe, 800, true);
  const animCountries = useCountUp(countries, 800, true);
  const animSit10 = useCountUp(sit10, 800, true);
  const animServe10 = useCountUp(serve10, 800, true);
  const animLongServe = useCountUp(longServe, 800, true);
  const animLongCourses = useCountUp(longCourses, 800, true);
  const animYearsMeditating = useCountUp(yearsMeditating, 800, true);
  const animYearsAT = useCountUp(yearsAT, 800, true);

  const secondaryMetrics = [
    {
      label: t("coursesSitting10d"),
      value: animSit10,
      onClick: () =>
        onFilterClick({
          label: tfilters("presets.sit10d"),
          filter: (c) => c.mode === "sit" && c.days === 10,
        }),
    },
    {
      label: t("coursesServing10d"),
      value: animServe10,
      onClick: () =>
        onFilterClick({
          label: tfilters("presets.serve10d"),
          filter: (c) => c.mode === "serve" && c.days === 10,
        }),
    },
    {
      label: t("longServing20d"),
      value: animLongServe,
      onClick: () =>
        onFilterClick({
          label: tfilters("presets.longServe20d"),
          filter: (c) => c.mode === "serve" && (c.days ?? 0) >= 20,
        }),
    },
    {
      label: t("longCourses20d"),
      value: animLongCourses,
      onClick: () =>
        onFilterClick({
          label: tfilters("presets.longCourses20d"),
          filter: (c) => (c.days ?? 0) >= 20,
        }),
    },
  ];

  return (
    <div className="space-y-8">
      {totalCourses === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Summary cards — hero stat cards (hidden when value is 0) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card
              className="card-interactive cursor-pointer"
              onClick={() => onFilterClick(null)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onFilterClick(null);
                }
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("totalCourses")}</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">
                  {animTotalCourses.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {totalDaysSit > 0 && (
              <Card
                className="card-interactive cursor-pointer"
                onClick={() =>
                  onFilterClick({
                    label: tfilters("presets.modeSit"),
                    filter: (c) => c.mode === "sit",
                  })
                }
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onFilterClick({
                      label: tfilters("presets.modeSit"),
                      filter: (c) => c.mode === "sit",
                    });
                  }
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("daysSitting")}</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">
                    {animTotalDaysSit.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {totalDaysServe > 0 && (
              <Card
                className="card-interactive cursor-pointer"
                onClick={() =>
                  onFilterClick({
                    label: tfilters("presets.modeServe"),
                    filter: (c) => c.mode === "serve",
                  })
                }
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onFilterClick({
                      label: tfilters("presets.modeServe"),
                      filter: (c) => c.mode === "serve",
                    });
                  }
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("daysServing")}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">
                    {animTotalDaysServe.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {countries > 0 && (
              <Card
                className="card-interactive cursor-pointer"
                onClick={() => setShowCountries(true)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowCountries(true);
                  }
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("countriesVisited")}</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">
                    {animCountries.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {yearsMeditating > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("yearsMeditating")}</CardTitle>
                  <Hourglass className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">
                    {animYearsMeditating.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {yearsAT > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("yearsAT")}</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">
                    {animYearsAT.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeStreak && (
              <Card className="border-primary/20 bg-primary/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("activeStreak")}</CardTitle>
                  <Flame className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums text-primary">
                    {activeStreakDays}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {activeStreakDays === 1 ? t("streakDay") : t("streakDays")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Secondary metrics — compact inline row (hidden when value is 0) */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border bg-card/50 px-5 py-3">
            {secondaryMetrics
              .filter((m) => m.value > 0)
              .map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={m.onClick}
                  className="text-left transition-colors hover:text-primary"
                >
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-lg font-semibold tabular-nums">{m.value.toLocaleString()}</p>
                </button>
              ))}
          </div>

          {/* Mode breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t("modeBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default">{ts("sit")}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {sitCount} {sitCount === 1 ? t("courseSingular") : t("coursePlural")}
                  </span>
                </div>
                <div className="flex-1">
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-secondary"
                    role="progressbar"
                    aria-valuenow={
                      totalCourses > 0 ? Math.round((sitCount / totalCourses) * 100) : 0
                    }
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t("progressLabel")}
                  >
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: totalCourses > 0 ? `${(sitCount / totalCourses) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{ts("serve")}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {serveCount} {serveCount === 1 ? t("courseSingular") : t("coursePlural")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent courses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t("recentCourses")}</CardTitle>
            </CardHeader>
            <CardContent>
              {recentCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noCourses")}</p>
              ) : (
                <div className="space-y-3">
                  {recentCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-medium">{course.place}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(course.start_date)} ·{" "}
                            {course.teacher || trecent("noTeacher")} · {course.days}{" "}
                            {tt("daysLabel", { days: course.days })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={course.mode === "sit" ? "default" : "secondary"}>
                        {tt(course.mode)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={showCountries} onOpenChange={setShowCountries}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("countriesDialogTitle")}</DialogTitle>
          </DialogHeader>
          {uniqueCountries.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {uniqueCountries.map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noCountries")}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// -- CoursesTableView --
function CoursesTableView({
  table,
  globalFilter,
  onGlobalFilterChange,
  filterPreset,
  onClearFilter,
  onView,
}: {
  table: ReturnType<typeof useReactTable<Course>>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  filterPreset: FilterPreset;
  onClearFilter: () => void;
  onView: (course: Course) => void;
}) {
  const t = useTranslations("Dashboard.table");
  const tt = useTranslations("Dashboard.table");
  const tfilters = useTranslations("Dashboard.filters");
  return (
    <>
      {filterPreset && (
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 px-2 py-1">
            {filterPreset.label}
            <button
              type="button"
              onClick={onClearFilter}
              className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
              aria-label={tfilters("clear")}
            >
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                <path
                  d="M3.5 3.5l5 5M8.5 3.5l-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </Badge>
          <span className="text-xs text-muted-foreground">
            {table.getRowModel().rows.length}{" "}
            {table.getRowModel().rows.length === 1 ? tt("courseSingular") : tt("coursePlural")}
          </span>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="mb-4 px-6 pt-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter}
                onChange={(e) => onGlobalFilterChange(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="pl-9"
                aria-label={t("searchPlaceholder")}
              />
            </div>
          </div>

          <div className="px-6 pb-6">
            <Table>
              <caption className="sr-only">{tt("tableCaption")}</caption>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder ? null : (
                          <button
                            type="button"
                            onClick={h.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1 hover:text-foreground"
                            aria-label={
                              h.column.getCanSort()
                                ? `${typeof h.column.columnDef.header === "string" ? h.column.columnDef.header : ""} — ${
                                    h.column.getIsSorted() === "asc"
                                      ? tt("sortAscending")
                                      : h.column.getIsSorted() === "desc"
                                        ? tt("sortDescending")
                                        : tt("sortNone")
                                  }`
                                : undefined
                            }
                          >
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {h.column.getCanSort() && (
                              <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )}
                          </button>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t("noResults")}
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onView(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
