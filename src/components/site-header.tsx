"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const router = useRouter();
  const qc = useQueryClient();
  const { theme, setTheme, resolvedTheme } = useTheme();
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
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 hover-scale">
            <img src="/logo.svg" alt="Vipa Cursos" className="h-7 w-auto" />
          </Link>
        <div className="flex items-center gap-3">
          {email && (
            <div
              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-medium text-primary ring-1 ring-primary/20 anim-scale-in hover:ring-primary/40 transition-shadow"
              title={email}
            >
              {image ? (
                <img src={image} alt={name ?? email} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
          )}
          {email && <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>}
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
            <Button variant="outline" size="sm" className="press-effect" onClick={handleLogout}>
              Cerrar sesión
            </Button>
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
