"use client";

import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("SiteFooter");

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-muted-foreground">
        <span>{t("copyright", { year: new Date().getFullYear() })}</span>
        <span>{t("tagline")}</span>
      </div>
    </footer>
  );
}
