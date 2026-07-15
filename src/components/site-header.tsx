"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  LogOut,
  CircleHelp,
  Image,
  RefreshCw,
  Globe,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { TransitionLink as Link } from "@/components/transition-link";
import { authClient } from "@/lib/auth-client";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { BackgroundPicker } from "@/components/background-picker";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const qc = useQueryClient();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useTranslations("SiteHeader") as any;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const { data: session } = authClient.useSession();
  const email = session?.user?.email;
  const name = session?.user?.name;
  const image = session?.user?.image;

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : (email?.[0]?.toUpperCase() ?? "?");

  const handleLogout = async () => {
    await authClient.signOut();
    qc.removeQueries({ queryKey: ["courses"] });
    router.push("/");
    router.refresh();
  };

  const handleRefresh = async () => {
    setSpinning(true);
    await qc.invalidateQueries();
    setSpinning(false);
  };

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === "en") {
      router.push(`/en${pathname}`);
    } else {
      router.push(pathname);
    }
  };

  const menuClassName =
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground";

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img src="/icons8-buddha-64.png" alt="Buddha" className="h-8 w-auto" />
          <span className="font-serif text-lg font-semibold tracking-tight">{t("siteName")}</span>
        </Link>

        {email ? (
          <div ref={menuRef} className="relative">
            {/* Avatar trigger */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-medium text-primary ring-1 ring-primary/20 transition-shadow hover:ring-primary/40 focus-visible:ring-primary/60"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              {image ? (
                <img
                  src={image}
                  alt={name ?? email}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                initials
              )}
            </button>

            {/* Dropdown */}
            <div
              className={cn(
                "absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border bg-card p-2 shadow-lg transition-all duration-150",
                menuOpen
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-1 opacity-0",
              )}
            >
              {/* User info */}
              <div className="border-b px-2 pb-2">
                <p className="truncate text-sm font-medium">{name ?? t("userMenu.name")}</p>
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              </div>

              {/* Refresh */}
              <button
                onClick={() => {
                  handleRefresh();
                  setMenuOpen(false);
                }}
                className={menuClassName}
              >
                <RefreshCw className={cn("h-3.5 w-3.5", spinning && "animate-spin")} />
                {t("userMenu.refresh")}
              </button>

              {/* Help */}
              <Link
                href="/ayuda"
                className={menuClassName}
                onClick={() => setMenuOpen(false)}
              >
                <CircleHelp className="h-3.5 w-3.5" />
                {t("userMenu.help")}
              </Link>

              {/* Theme toggle */}
              <button
                onClick={() => {
                  setTheme(resolvedTheme === "dark" ? "light" : "dark");
                  setMenuOpen(false);
                }}
                className={menuClassName}
              >
                {mounted && resolvedTheme === "dark" ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
                {t("userMenu.theme")}
              </button>

              {/* Language */}
              <div className="border-t pt-1">
                <div className="px-2 py-1.5">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    {t("userMenu.language")}
                  </span>
                  <div className="mt-1 flex gap-1">
                    <button
                      onClick={() => handleLocaleChange("es")}
                      className={cn(
                        "rounded px-3 py-1 text-xs font-medium transition-colors",
                        locale === "es"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent",
                      )}
                    >
                      ES
                    </button>
                    <button
                      onClick={() => handleLocaleChange("en")}
                      className={cn(
                        "rounded px-3 py-1 text-xs font-medium transition-colors",
                        locale === "en"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent",
                      )}
                    >
                      EN
                    </button>
                  </div>
                </div>
              </div>

              {/* Background */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setPickerOpen(true);
                }}
                className={menuClassName}
              >
                <Image className="h-3.5 w-3.5" />
                {t("userMenu.background")}
              </button>

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t("userMenu.signOut")}
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <BackgroundPicker open={pickerOpen} onOpenChange={setPickerOpen} />
    </header>
  );
}
