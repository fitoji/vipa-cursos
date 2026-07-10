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
import { Search, ArrowUpDown, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { listCourses, deleteCourse } from "@/app/actions/courses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { EditCourseDialog } from "@/components/edit-course-dialog";

type Course = Awaited<ReturnType<typeof listCourses>>[number];

const coursesQuery = queryOptions({
  queryKey: ["courses"],
  queryFn: () => listCourses(),
});

const columnHelper = createColumnHelper<Course>();

export default function Dashboard() {
  const { data: courses = [] } = useQuery(coursesQuery);
  const qc = useQueryClient();
  const del = deleteCourse;
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "start_date", desc: true }]);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);

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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {courses.length} curso{courses.length === 1 ? "" : "s"} registrado
              {courses.length === 1 ? "" : "s"}.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Link>
          </Button>
        </div>

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
    </div>
  );
}
