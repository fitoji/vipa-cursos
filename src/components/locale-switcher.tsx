"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useTranslations("common") as any;

  const locales = [
    { code: "es", label: "ES" },
    { code: "en", label: "EN" },
  ] as const;

  const handleLocaleChange = (newLocale: string) => {
    // usePathname() from @/i18n/navigation returns internal path (no locale prefix)
    // useRouter() from next/navigation pushes raw URL — no locale re-prefixing
    if (newLocale === "en") {
      router.push(`/en${pathname}`);
    } else {
      router.push(pathname);
    }
  };

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="h-8 w-[72px]" aria-label={t("locale")}>
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <SelectValue placeholder={t("locale")} />
      </SelectTrigger>
      <SelectContent className="w-[72px]" position="popper">
        {locales.map((l) => (
          <SelectItem
            key={l.code}
            value={l.code}
          >
            <span>{l.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
