"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  BarChart3,
  BookOpen,
  MapPin,
  Loader2,
  Download,
  Upload,
  ArrowLeft,
  Trash2,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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

export function AppSidebar({ activeView, onNavigate }: AppSidebarProps) {
  const [downloading, setDownloading] = useState(false);
  const t = useTranslations("Dashboard.sidebar");
  const ttoast = useTranslations("Dashboard.toast");

  const navItems: {
    view: View;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { view: "stats", label: t("stats"), icon: BarChart3 },
    { view: "courses", label: t("allCourses"), icon: BookOpen },
    { view: "locations", label: t("centers"), icon: MapPin },
  ];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const courses = await listCourses();
      if (courses.length === 0) {
        toast.info(t("noData"));
        return;
      }
      const json = JSON.stringify(courses, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vipabase-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(ttoast("downloadSuccess", { count: courses.length }));
    } catch {
      toast.error(ttoast("downloadError"));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-2">
          <img src="/logo-icon.svg" alt="VipaBase" className="h-8 w-auto" />
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/racha">
                    <Flame className="h-4 w-4" />
                    <span>{t("racha")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled={downloading} onClick={handleDownload}>
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{downloading ? t("downloading") : t("download")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeView === "import"}
              onClick={() => onNavigate("import")}
            >
              <Upload className="h-4 w-4" />
              <span>{t("import")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/cursos">
                <ArrowLeft className="h-4 w-4" />
                <span>{t("back")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
