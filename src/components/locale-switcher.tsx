"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useTranslations("common") as any;

  const locales = [
    { code: "es", label: "Español" },
    { code: "en", label: "English" },
  ] as const;

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === "en") {
      router.push(`/en${pathname}`);
    } else {
      router.push(pathname);
    }
  };

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="h-8 w-[120px] justify-between gap-2" aria-label={t("locale")}>
        <span className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder={t("locale")} />
        </span>
      </SelectTrigger>
      <SelectContent className="w-[120px]" position="popper">
        {locales.map((l) => (
          <SelectItem
            key={l.code}
            value={l.code}
            className={cn("flex items-center gap-2", locale === l.code && "bg-primary/10")}
          >
            <span>{l.label}</span>
            {locale === l.code && <span className="ml-auto text-primary">✓</span>}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
