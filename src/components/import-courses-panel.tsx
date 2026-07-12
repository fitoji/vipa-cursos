"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { importCourses } from "@/app/actions/courses";
import { courseImportSchema, type CourseImport } from "@/lib/course-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInView, staggerDelay } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

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
  const [tableRef, tableInView] = useInView(0.05);

  const t = useTranslations("ImportCourses");
  const ttoast = useTranslations("ImportCourses.toast");
  const tbuttons = useTranslations("ImportCourses.buttons");
  const terrors = useTranslations("ImportCourses.errors");
  const tdrag = useTranslations("ImportCourses.dropzone");
  const tformat = useTranslations("ImportCourses.format");
  const ttable = useTranslations("ImportCourses.table");
  const tpreview = useTranslations("ImportCourses.preview");

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
      setParseError(terrors("invalidJson"));
      return;
    }
    if (!Array.isArray(parsed)) {
      setParseError(terrors("notArray"));
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

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const readFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setParseError(terrors("fileTooLarge"));
      return;
    }
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      setParseError(terrors("mustBeJson"));
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
      toast.success(ttoast("imported", { count, cplural: count === 1 ? "" : "s" }));
      await qc.invalidateQueries({ queryKey: ["courses"] });
      setText("");
      setItems(null);
      setResults(null);
      setParseError(null);
      onImported?.();
    } catch (e) {
      console.error(e);
      toast.error(ttoast("importError"));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{t("pageTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("pageDescription")}</p>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={tdrag("ariaLabel")}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed p-6 text-center text-sm text-muted-foreground transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02] shadow-lg shadow-primary/20"
            : "border-border",
        )}
      >
        <span className="font-medium text-foreground">{tdrag("dragLabel")}</span>
        <span>{tdrag("clickLabel")}</span>
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
        placeholder={t("textareaPlaceholder")}
        rows={6}
        className="font-mono text-xs"
      />

      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="mb-1 font-medium">{tformat("title")}</p>
        <pre className="overflow-x-auto text-muted-foreground">{EXAMPLE}</pre>
        <ul className="mt-2 list-disc space-y-0.5 pl-4 text-muted-foreground">
          <li>
            <code>start_date</code>, <code>place</code>: {tformat("required", { field: "" })}.
          </li>
          <li>
            <code>mode</code>:{" "}
            {tformat("modeInfo", { field: "mode", values: tformat("modeValues") })}.
          </li>
          <li>
            <code>days</code>: {tformat("daysInfo", { field: "days" })}.
          </li>
          <li>
            <code>teacher</code>, <code>country</code>, <code>obs</code>:{" "}
            {tformat("optional", { fields: "" })}.
          </li>
          <li className="font-medium text-amber-600 dark:text-amber-400">
            {tformat("unknownTip", { code: "", empty: "" })}
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
            {tpreview("summary", {
              total: items.length,
              plural: items.length === 1 ? "" : "s",
              valid: validData.length,
              vplural: validData.length === 1 ? "" : "s",
              invalid: invalidCount,
            })}
          </p>

          <div ref={tableRef} className="card-interactive rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{ttable("header.date")}</TableHead>
                  <TableHead>{ttable("header.place")}</TableHead>
                  <TableHead>{ttable("header.mode")}</TableHead>
                  <TableHead>{ttable("header.days")}</TableHead>
                  <TableHead>{ttable("header.teacher")}</TableHead>
                  <TableHead>{ttable("header.country")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => {
                  const res = results[i];
                  const raw = item as Record<string, unknown>;
                  return (
                    <TableRow
                      key={`${i}-${raw.start_date}-${raw.place}`}
                      className={cn(
                        res.ok ? "" : "bg-destructive/5 text-destructive",
                        tableInView && "anim-fade-up",
                      )}
                      style={tableInView ? staggerDelay(i, 50) : undefined}
                    >
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
              <p className="mb-1 font-medium">{tpreview("errorTitle")}</p>
              <ul className="list-disc space-y-0.5 pl-4">
                {results.map((r, i) =>
                  !r.ok ? (
                    <li key={r.errors.join(";")}>
                      {tpreview("rowError", { index: i + 1, errors: r.errors.join("; ") })}
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
          {tbuttons("clear")}
        </Button>
        <Button type="button" disabled={!canImport} onClick={onImport}>
          {importing
            ? tbuttons("importing")
            : tbuttons("importCount", {
                count: validData.length,
                cplural: validData.length === 1 ? "" : "s",
              })}
        </Button>
      </div>
    </div>
  );
}
