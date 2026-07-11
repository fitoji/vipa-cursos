"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const router = useRouter();
  const qc = useQueryClient();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { data: session } = authClient.useSession();
  const email = session?.user?.email;
  const name = session?.user?.name;
  const image = session?.user?.image;

  // Get initials from name or email
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : email?.[0]?.toUpperCase() ?? "?";

  const handleLogout = async () => {
    await authClient.signOut();
    qc.removeQueries({ queryKey: ["courses"] });
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 hover-scale">
            <img src="/logo.svg" alt="Vipa Cursos" className="h-7 w-auto" />
          </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="hover-scale"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Cambiar tema"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 transition-transform duration-300" />
            ) : (
              <Moon className="h-4 w-4 transition-transform duration-300" />
            )}
          </Button>

          {email ? (
            <div className="group relative">
              {/* Avatar trigger */}
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-medium text-primary ring-1 ring-primary/20 anim-scale-in group-hover:ring-primary/40 transition-shadow">
                {image ? (
                  <img src={image} alt={name ?? email} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>

              {/* Dropdown */}
              <div className="invisible absolute right-0 top-full z-50 mt-2 w-48 translate-y-1 rounded-lg border bg-card p-2 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="border-b px-2 pb-2">
                  <p className="truncate text-sm font-medium">{name ?? "Usuario"}</p>
                  <p className="truncate text-xs text-muted-foreground">{email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
