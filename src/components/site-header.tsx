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
import { useState, useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { TransitionLink as Link } from "@/components/transition-link";
import { authClient } from "@/lib/auth-client";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BackgroundPicker } from "@/components/background-picker";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const qc = useQueryClient();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useTranslations("SiteHeader") as any;

  useEffect(() => setMounted(true), []);

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

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img src="/icons8-buddha-64.png" alt="Buddha" className="h-8 w-auto" />
          <span className="font-serif text-lg font-semibold tracking-tight">{t("siteName")}</span>
        </Link>

        {email ? (
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button
                type="button"
                className="flex size-8 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-medium text-primary ring-1 ring-primary/20 transition-all duration-200 hover:scale-110 hover:ring-primary/40 hover:shadow-md hover:[animation:avatar-ring_2s_ease-in-out_infinite] focus-visible:ring-primary/60 active:scale-95"
                aria-label={name ?? email}
              >
                {image ? (
                  <Avatar className="size-8">
                    <AvatarImage src={image} alt={name ?? email ?? ""} referrerPolicy="no-referrer" />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="size-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                )}
              </button>
            } />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <p className="truncate text-sm font-medium">{name ?? t("userMenu.name")}</p>
                <p className="truncate text-xs text-muted-foreground font-normal">{email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleRefresh}>
                <RefreshCw className={cn("size-3.5", spinning && "animate-spin")} />
                {t("userMenu.refresh")}
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/ayuda">
                  <CircleHelp className="size-3.5" />
                  {t("userMenu.help")}
                </Link>} />
              <DropdownMenuItem onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
                {mounted && resolvedTheme === "dark" ? (
                  <Sun className="size-3.5" />
                ) : (
                  <Moon className="size-3.5" />
                )}
                {t("userMenu.theme")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="size-3.5" />
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setPickerOpen(true)}>
                <Image className="size-3.5" />
                {t("userMenu.background")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="size-3.5" />
                {t("userMenu.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      <BackgroundPicker open={pickerOpen} onOpenChange={setPickerOpen} />
    </header>
  );
}
