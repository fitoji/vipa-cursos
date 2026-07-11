"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, BookOpen, ArrowLeft, Upload, Download, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { listCourses } from "@/app/actions/courses";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";

type View = "stats" | "courses" | "locations" | "import";

interface AppSidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const navItems: { view: View; label: string; icon: React.ComponentType<{ className?: string }> }[] =
  [
    { view: "stats", label: "Estadísticas", icon: BarChart3 },
    { view: "courses", label: "Ver todos los cursos", icon: BookOpen },
    { view: "locations", label: "Centros Vipassana", icon: MapPin },
  ];

export function AppSidebar({ activeView, onNavigate }: AppSidebarProps) {
  const [downloading, setDownloading] = useState(false);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-2">
          <h2 className="text-lg font-semibold tracking-tight">Vipa Cursos</h2>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton
                    isActive={activeView === item.view}
                    onClick={() => onNavigate(item.view)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              disabled={downloading}
              onClick={async () => {
                setDownloading(true);
                try {
                  const courses = await listCourses();
                  if (courses.length === 0) {
                    toast.info("No hay cursos para descargar");
                    return;
                  }
                  const json = JSON.stringify(courses, null, 2);
                  const blob = new Blob([json], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `vipa-cursos-${new Date().toISOString().slice(0, 10)}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast.success(`${courses.length} cursos descargados`);
                } catch {
                  toast.error("Error al descargar");
                } finally {
                  setDownloading(false);
                }
              }}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{downloading ? "Descargando…" : "Descargar datos"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeView === "import"}
              onClick={() => onNavigate("import")}
            >
              <Upload className="h-4 w-4" />
              <span>Importar datos</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/cursos">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
