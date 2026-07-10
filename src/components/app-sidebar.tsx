"use client";

import Link from "next/link";
import { BarChart3, BookOpen, ArrowLeft, Upload } from "lucide-react";

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

type View = "stats" | "courses" | "import";

interface AppSidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const navItems: { view: View; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { view: "stats", label: "Estadísticas", icon: BarChart3 },
  { view: "courses", label: "Ver todos los cursos", icon: BookOpen },
];

export function AppSidebar({ activeView, onNavigate }: AppSidebarProps) {
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
              isActive={activeView === "import"}
              onClick={() => onNavigate("import")}
            >
              <Upload className="h-4 w-4" />
              <span>Importar datos</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
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
