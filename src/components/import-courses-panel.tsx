"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { importCourses } from "@/app/actions/courses";
import { courseImportSchema, type CourseImport } from "@/lib/course-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

type RowResult = { ok: true; data: CourseImport } | { ok: false; errors: string[] };

export function ImportCoursesPanel({ onImported }: { onImported?: () => void }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [items, setItems] = useState<unknown[] | null>(null);
  const [results, setResults] = useState<RowResult[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (value: string) => {
    setText(value);
    setItems(null);
    setResults(null);
    setParseError(null);
    if (!value.trim()) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      setParseError("JSON inválido: revisá que el contenido sea un arreglo correcto.");
      return;
    }
    if (!Array.isArray(parsed)) {
      setParseError("El JSON debe ser un arreglo de cursos.");
      return;
    }

    const rowResults: RowResult[] = parsed.map((item) => {
      const r = courseImportSchema.safeParse(item);
      if (r.success) return { ok: true, data: r.data };
      return {
        ok: false,
        errors: r.error.issues.map((iss) =>
          iss.path.length > 0 ? `${iss.path.join(".")}: ${iss.message}` : iss.message,
        ),
      };
    });
    setItems(parsed);
    setResults(rowResults);
  };

  const readFile = async (file: File) => {
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      setParseError("El archivo debe ser .json");
      return;
    }
    const content = await file.text();
    validate(content);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void readFile(file);
  };

  const validRows = results?.filter((r): r is { ok: true; data: CourseImport } => r.ok) ?? [];
  const validData = validRows.map((r) => r.data);
  const invalidCount = results ? results.length - validRows.length : 0;
  const canImport = !!results && results.length > 0 && invalidCount === 0 && !importing;

  const onImport = async () => {
    if (!canImport) return;
    setImporting(true);
    try {
      const { count } = await importCourses({ data: validData });
      toast.success(`${count} curso${count === 1 ? "" : "s"} importado${count === 1 ? "" : "s"}`);
      await qc.invalidateQueries({ queryKey: ["courses"] });
      setText("");
      setItems(null);
      setResults(null);
      setParseError(null);
      onImported?.();
    } catch (e) {
      console.error(e);
      toast.error("No se pudo importar");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Importar cursos (JSON)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pegá o arrastrá un archivo <code>.json</code> con un arreglo de cursos. Vas a ver el
          detalle abajo antes de importar.
        </p>
      </div>

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
        onChange={(e) => validate(e.target.value)}
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

      {parseError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          {parseError}
        </div>
      )}

      {results && items && (
        <>
          <p className="text-sm">
            Se detectaron {items.length} curso{items.length === 1 ? "" : "s"} ·{" "}
            <span className="font-medium text-emerald-600">
              {validData.length} válido{validData.length === 1 ? "" : "s"}
            </span>{" "}
            ·{" "}
            <span className={invalidCount > 0 ? "font-medium text-destructive" : ""}>
              {invalidCount} con errores
            </span>
          </p>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Lugar</TableHead>
                  <TableHead>Modo</TableHead>
                  <TableHead>Días</TableHead>
                  <TableHead>Profesor</TableHead>
                  <TableHead>País</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => {
                  const res = results[i];
                  const raw = item as Record<string, unknown>;
                  return (
                    <TableRow key={String(raw.start_date ?? "") + "-" + String(raw.place ?? "") + "-" + String(raw.teacher ?? "")} className={res.ok ? "" : "bg-destructive/5 text-destructive"}>
                      <TableCell>{String(raw.start_date ?? "—")}</TableCell>
                      <TableCell>{String(raw.place ?? "—")}</TableCell>
                      <TableCell>
                        {res.ok ? (
                          <Badge variant={res.data.mode === "sit" ? "default" : "secondary"}>
                            {res.data.mode}
                          </Badge>
                        ) : (
                          <span>{String(raw.mode ?? "—")}</span>
                        )}
                      </TableCell>
                      <TableCell>{String(raw.days ?? "—")}</TableCell>
                      <TableCell>{String(raw.teacher ?? "—")}</TableCell>
                      <TableCell>{String(raw.country ?? "—")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {invalidCount > 0 && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <p className="mb-1 font-medium">Filas con errores:</p>
              <ul className="list-disc space-y-0.5 pl-4">
                {results.map((r, i) =>
                  !r.ok ? (
                    <li key={r.errors.join(";")}>
                      Fila {i + 1}: {r.errors.join("; ")}
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setText("");
            setItems(null);
            setResults(null);
            setParseError(null);
          }}
        >
          Limpiar
        </Button>
        <Button type="button" disabled={!canImport} onClick={onImport}>
          {importing
            ? "Importando…"
            : `Importar ${validData.length} curso${validData.length === 1 ? "" : "s"}`}
        </Button>
      </div>
    </div>
  );
}
