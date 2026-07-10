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
  BookOpen,
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
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { EditCourseDialog } from "@/components/edit-course-dialog";
import { ImportCoursesPanel } from "@/components/import-courses-panel";
import { AppSidebar } from "@/components/app-sidebar";

type Course = Awaited<ReturnType<typeof listCourses>>[number];
type View = "stats" | "courses" | "import";

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

  const setView = (v: View) => {
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
    const countries = new Set(courses.map((c) => c.country).filter(Boolean)).size;
    const sitCount = courses.filter((c) => c.mode === "sit").length;
    const serveCount = courses.filter((c) => c.mode === "serve").length;
    const recentCourses = [...courses]
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
      .slice(0, 5);

    return { totalCourses, totalDaysSit, totalDaysServe, countries, sitCount, serveCount, recentCourses };
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

  const table = useReactTable({
    data: courses,
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
      <AppSidebar activeView={view} onNavigate={setView} />
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
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Link>
              </Button>
            </div>

            {view === "stats" ? (
              <div className="space-y-8">
                {/* Summary cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total cursos</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalCourses.toLocaleString()}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Días sentados</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalDaysSit.toLocaleString()}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Días sirviendo</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalDaysServe.toLocaleString()}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Países distintos</CardTitle>
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.countries.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Mode breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Desglose por modo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">sit</Badge>
                        <span className="text-sm text-muted-foreground">
                          {stats.sitCount} curso{stats.sitCount === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: stats.totalCourses > 0
                                ? `${(stats.sitCount / stats.totalCourses) * 100}%`
                                : "0%",
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">serve</Badge>
                        <span className="text-sm text-muted-foreground">
                          {stats.serveCount} curso{stats.serveCount === 1 ? "" : "s"}
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
                    {stats.recentCourses.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sin cursos registrados.</p>
                    ) : (
                      <div className="space-y-3">
                        {stats.recentCourses.map((course) => (
                          <div
                            key={course.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{course.place}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(course.start_date).toLocaleDateString()} ·{" "}
                                  {course.teacher || "Sin profesor"} · {course.days} días
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
              </div>
            ) : view === "courses" ? (
              /* ── Courses View ── */
              <>
                <div className="mb-4 relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Buscar por lugar, profesor, país…"
                    className="pl-9"
                  />
                </div>

                <div className="rounded-md border">
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
                            colSpan={columns.length}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Sin resultados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id}>
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
            ) : (
              <ImportCoursesPanel onImported={() => setView("courses")} />
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
                {deleting ? `${deleting.place} — ${deleting.days} días (${deleting.mode})` : ""}. Esta
                acción no se puede deshacer.
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
