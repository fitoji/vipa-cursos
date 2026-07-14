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
  const t = useTranslations("ImportCourses");
  const ttoast = useTranslations("ImportCourses.toast");
  const tbuttons = useTranslations("ImportCourses.buttons");
  const terrors = useTranslations("ImportCourses.errors");
  const tdrag = useTranslations("ImportCourses.dropzone");
  const tformat = useTranslations("ImportCourses.format");
  const tpreview = useTranslations("ImportCourses.preview");

  const readFile = async (file: File) => {
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      setErrors([terrors("mustBeJson")]);
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
      setErrors([terrors("invalidJson")]);
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
      toast.success(ttoast("imported", { count, cplural: count === 1 ? "" : "s" }));
      await qc.invalidateQueries({ queryKey: ["courses"] });
      setText("");
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error(ttoast("importError"));
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button variant="outline">{tbuttons("import")}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription", { code: ".json" })}</DialogDescription>
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
            onChange={(e) => setText(e.target.value)}
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

          {errors && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <p className="mb-1 font-medium">{terrors("validationTitle")}</p>
              <ul className="list-disc space-y-0.5 pl-4">
                {errors.map((err, i) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {tbuttons("cancel")}
          </Button>
          <Button type="button" disabled={importing || !text.trim()} onClick={onImport}>
            {importing ? tbuttons("importing") : tbuttons("import")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
