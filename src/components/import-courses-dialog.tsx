"use client";

import { useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { importCourses } from "@/app/actions/courses";
import { courseImportArraySchema } from "@/lib/course-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const EXAMPLE = `[
  {
    "start_date": "2023-04-10",
    "place": "Dhamma Medini",
    "teacher": "S.N. Goenka",
    "country": "Argentina",
    "mode": "sit",
    "days": 10,
    "obs": "Mi primer curso"
  }
]`;

function formatIssues(issues: { path: (string | number)[]; message: string }[]): string[] {
  return issues.map((i) => {
    if (i.path.length >= 2 && typeof i.path[0] === "number") {
      return `Fila ${i.path[0] + 1} · ${i.path.slice(1).join(".")}: ${i.message}`;
    }
    return i.message;
  });
}

export function ImportCoursesDialog({ children }: { children?: ReactNode }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[] | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFile = async (file: File) => {
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      setErrors(["El archivo debe ser .json"]);
      return;
    }
    const content = await file.text();
    setText(content);
    setErrors(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void readFile(file);
  };

  const onImport = async () => {
    setErrors(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setErrors(["JSON inválido: revisá que el contenido sea un arreglo correcto."]);
      return;
    }
    const result = courseImportArraySchema.safeParse(parsed);
    if (!result.success) {
      setErrors(formatIssues(result.error.issues));
      return;
    }
    setImporting(true);
    try {
      const { count } = await importCourses({ data: result.data });
      toast.success(`${count} curso${count === 1 ? "" : "s"} importado${count === 1 ? "" : "s"}`);
      await qc.invalidateQueries({ queryKey: ["courses"] });
      setText("");
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("No se pudo importar");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button variant="outline">Importar JSON</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar cursos (JSON)</DialogTitle>
          <DialogDescription>
            Pegá o arrastrá un archivo <code>.json</code> con un arreglo de cursos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed p-6 text-center text-sm text-muted-foreground transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <span className="font-medium text-foreground">Arrastrá tu archivo .json acá</span>
            <span>o hacé clic para seleccionarlo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void readFile(file);
              }}
            />
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="O pegá el JSON acá…"
            rows={6}
            className="font-mono text-xs"
          />

          <div className="rounded-md bg-muted p-3 text-xs">
            <p className="mb-1 font-medium">Formato esperado</p>
            <pre className="overflow-x-auto text-muted-foreground">{EXAMPLE}</pre>
            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-muted-foreground">
              <li>
                <code>start_date</code>, <code>place</code>: obligatorios.
              </li>
              <li>
                <code>mode</code>: solo <code>"sit"</code> o <code>"serve"</code>.
              </li>
              <li>
                <code>days</code>: número entero positivo.
              </li>
              <li>
                <code>teacher</code>, <code>country</code>, <code>obs</code>: opcionales.
              </li>
            </ul>
          </div>

          {errors && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <p className="mb-1 font-medium">Corregí estos errores:</p>
              <ul className="list-disc space-y-0.5 pl-4">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={importing || !text.trim()} onClick={onImport}>
            {importing ? "Importando…" : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
