"use client";

import { useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import Link from "next/link";
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
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Globe,
  Clock,
  Users,
  UserCheck,
  HeartHandshake,
  TrendingUp,
  Award,
  BookOpen,
  FileText,
  MessageSquare,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { listCourses, deleteCourse } from "@/app/actions/courses";
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
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { EditCourseDialog } from "@/components/edit-course-dialog";
import { ImportCoursesPanel } from "@/components/import-courses-panel";
import { LocationsExplorer } from "@/components/locations-explorer";
import { AppSidebar } from "@/components/app-sidebar";
import { formatDate } from "@/lib/format";
import { useInView, useCountUp, staggerDelay } from "@/lib/animations";
import { cn } from "@/lib/utils";

type Course = Awaited<ReturnType<typeof listCourses>>[number];
type View = "stats" | "courses" | "locations" | "import";

type FilterPreset = {
  label: string;
  filter: (c: Course) => boolean;
} | null;

const coursesQuery = queryOptions({
  queryKey: ["courses"],
  queryFn: () => listCourses(),
});

const columnHelper = createColumnHelper<Course>();

export function DashboardView() {
  const { data: courses = [] } = useQuery(coursesQuery);
  const qc = useQueryClient();
  const del = deleteCourse;
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "start_date", desc: true }]);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const [view, setViewState] = useState<View>("stats");
  const [filterPreset, setFilterPreset] = useState<FilterPreset>(null);

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
      toast.success("Curso eliminado");
      await qc.invalidateQueries({ queryKey: ["courses"] });
      setDeleting(null);
    } catch (e) {
      console.error(e);
      toast.error("No se pudo eliminar");
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
    const recentCourses = [...courses]
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
      .slice(0, 5);

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
      recentCourses,
    };
  }, [courses]);

  // --- Table ---
  const columns = useMemo(
    () => [
      columnHelper.accessor("start_date", {
        header: "Fecha",
        cell: (i) => new Date(i.getValue()).toLocaleDateString(),
      }),
      columnHelper.accessor("place", { header: "Lugar" }),
      columnHelper.accessor("teacher", {
        header: "Profesor",
        cell: (i) => i.getValue() || "—",
      }),
      columnHelper.accessor("country", {
        header: "País",
        cell: (i) => i.getValue() || "—",
      }),
      columnHelper.accessor("mode", {
        header: "Modo",
        cell: (i) => (
          <Badge variant={i.getValue() === "sit" ? "default" : "secondary"}>{i.getValue()}</Badge>
        ),
      }),
      columnHelper.accessor("days", {
        header: "Días",
        cell: (i) => <Badge variant="outline">{i.getValue()}</Badge>,
      }),
      columnHelper.accessor("obs", {
        header: "Observaciones",
        cell: (i) => (
          <span className="line-clamp-2 text-sm text-muted-foreground">{i.getValue() || "—"}</span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Acciones</span>,
        cell: (i) => (
          <div className="flex justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setEditing(i.row.original)}
              aria-label="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setDeleting(i.row.original)}
              aria-label="Eliminar"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [],
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
        <div className="min-h-screen bg-background">
          <div className="mx-auto max-w-6xl px-4 py-10">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight">Panel de Control</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {courses.length} curso{courses.length === 1 ? "" : "s"} registrado
                    {courses.length === 1 ? "" : "s"}.
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/cursos">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Link>
              </Button>
            </div>

            {view === "stats" ? (
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

        <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este curso?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleting ? `${deleting.place} — ${deleting.days} días (${deleting.mode})` : ""}.
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={busyDelete}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={busyDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {busyDelete ? "Eliminando…" : "Eliminar"}
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
  const [emptyRef, emptyInView] = useInView(0.1);
  const [copied, setCopied] = useState(false);

  const promptText = `Convierte estos datos de cursos de Vipassana al siguiente formato JSON:
[{"date":"YYYY-MM-DD","type":"sit","country":"...","location":"...","notes":"..."}]
mis datos son: [PEGAR AQUÍ]`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={emptyRef} className={cn("space-y-6", emptyInView && "anim-fade-up")}>
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold">No hay cursos registrados</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Importá tus datos desde un archivo JSON o ingresá tus cursos manualmente.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/cursos">
                <Upload className="mr-2 h-4 w-4" /> Agregar curso
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card
        className={cn(emptyInView && "anim-fade-up")}
        style={emptyInView ? staggerDelay(1) : undefined}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" />
            ¿Tenés datos en Excel o Word?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Copiá tus datos y pegalos en ChatGPT con este prompt:
          </p>
          <div className="relative rounded-lg border bg-muted/50 p-4 font-mono text-xs">
            <pre className="whitespace-pre-wrap">{promptText}</pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-2"
              onClick={handleCopy}
            >
              {copied ? (
                <span className="text-xs text-emerald-600">Copiado</span>
              ) : (
                <span className="text-xs">Copiar</span>
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
  recentCourses,
  courses,
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
  recentCourses: Course[];
  courses: Course[];
  onFilterClick: (preset: FilterPreset) => void;
}) {
  const [statsRef, statsInView] = useInView(0.1);
  const [listRef, listInView] = useInView(0.1);

  const animTotalCourses = useCountUp(totalCourses, 800, statsInView);
  const animTotalDaysSit = useCountUp(totalDaysSit, 800, statsInView);
  const animTotalDaysServe = useCountUp(totalDaysServe, 800, statsInView);
  const animCountries = useCountUp(countries, 800, statsInView);
  const animSit10 = useCountUp(sit10, 800, statsInView);
  const animServe10 = useCountUp(serve10, 800, statsInView);
  const animLongServe = useCountUp(longServe, 800, statsInView);
  const animLongCourses = useCountUp(longCourses, 800, statsInView);

  return (
    <div className="space-y-8">
      {totalCourses === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Summary cards */}
          <div ref={statsRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              className={cn("card-interactive cursor-pointer", statsInView && "anim-fade-up")}
              style={statsInView ? staggerDelay(0) : undefined}
              onClick={() => onFilterClick(null)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total cursos</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{animTotalCourses.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card
              className={cn("card-interactive cursor-pointer", statsInView && "anim-fade-up")}
              style={statsInView ? staggerDelay(1) : undefined}
              onClick={() => onFilterClick({ label: "Modo: sit", filter: (c) => c.mode === "sit" })}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Días sentados</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{animTotalDaysSit.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card
              className={cn("card-interactive cursor-pointer", statsInView && "anim-fade-up")}
              style={statsInView ? staggerDelay(2) : undefined}
              onClick={() => onFilterClick({ label: "Modo: serve", filter: (c) => c.mode === "serve" })}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Días sirviendo</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{animTotalDaysServe.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card
              className={cn("card-interactive cursor-pointer", statsInView && "anim-fade-up")}
              style={statsInView ? staggerDelay(3) : undefined}
              onClick={() => {
                const uniqueCountries = [...new Set(courses.flatMap((c) => (c.country ? [c.country] : [])))]
                  .filter(Boolean)
                  .sort();
                alert(uniqueCountries.length > 0 ? uniqueCountries.join(", ") : "Sin países registrados");
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Países distintos</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{animCountries.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card
              className={cn("card-interactive cursor-pointer", statsInView && "anim-fade-up")}
              style={statsInView ? staggerDelay(4) : undefined}
              onClick={() => onFilterClick({ label: "Sentados (10d)", filter: (c) => c.mode === "sit" && c.days === 10 })}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cursos sentados (10d)</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{animSit10.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card
              className={cn("card-interactive cursor-pointer", statsInView && "anim-fade-up")}
              style={statsInView ? staggerDelay(5) : undefined}
              onClick={() => onFilterClick({ label: "Sirviendo (10d)", filter: (c) => c.mode === "serve" && c.days === 10 })}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cursos sirviendo (10d)</CardTitle>
                <HeartHandshake className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{animServe10.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card
              className={cn("card-interactive cursor-pointer", statsInView && "anim-fade-up")}
              style={statsInView ? staggerDelay(6) : undefined}
              onClick={() => onFilterClick({ label: "Largos sirviendo (20d+)", filter: (c) => c.mode === "serve" && (c.days ?? 0) >= 20 })}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Largos sirviendo (20d+)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{animLongServe.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card
              className={cn("card-interactive cursor-pointer", statsInView && "anim-fade-up")}
              style={statsInView ? staggerDelay(7) : undefined}
              onClick={() => onFilterClick({ label: "Cursos largos (20d+)", filter: (c) => (c.days ?? 0) >= 20 })}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cursos largos (20d+)</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{animLongCourses.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Mode breakdown */}
          <Card
            className={cn(statsInView && "anim-fade-up")}
            style={statsInView ? staggerDelay(8) : undefined}
          >
            <CardHeader>
              <CardTitle className="text-sm font-medium">Desglose por modo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default">sit</Badge>
                  <span className="text-sm text-muted-foreground">
                    {sitCount} curso{sitCount === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: totalCourses > 0 ? `${(sitCount / totalCourses) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">serve</Badge>
                  <span className="text-sm text-muted-foreground">
                    {serveCount} curso{serveCount === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent courses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Cursos recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin cursos registrados.</p>
              ) : (
                <div ref={listRef} className="space-y-3">
                  {recentCourses.map((course, i) => (
                    <div
                      key={course.id}
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3",
                        listInView && "anim-fade-up",
                      )}
                      style={listInView ? staggerDelay(i) : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{course.place}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(course.start_date)} · {course.teacher || "Sin profesor"} ·{" "}
                            {course.days} días
                          </p>
                        </div>
                      </div>
                      <Badge variant={course.mode === "sit" ? "default" : "secondary"}>
                        {course.mode}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
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
}: {
  table: ReturnType<typeof useReactTable<Course>>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  filterPreset: FilterPreset;
  onClearFilter: () => void;
}) {
  const [tableRef, tableInView] = useInView(0.05);

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
              aria-label="Quitar filtro"
            >
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                <path d="M3.5 3.5l5 5M8.5 3.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </Badge>
          <span className="text-xs text-muted-foreground">
            {table.getRowModel().rows.length} curso{table.getRowModel().rows.length === 1 ? "" : "s"}
          </span>
        </div>
      )}

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={globalFilter}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          placeholder="Buscar por lugar, profesor, país…"
          className="pl-9"
        />
      </div>

      <div ref={tableRef} className="rounded-md border">
        <Table>
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
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getCanSort() && <ArrowUpDown className="h-3 w-3 opacity-50" />}
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
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  className={cn(tableInView && "anim-fade-up")}
                  style={tableInView ? staggerDelay(i, 40) : undefined}
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
    </>
  );
}
