import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard-view";

export const metadata: Metadata = {
  title: "Panel de Control",
  description:
    "Vista completa de tus cursos de meditación Vipassana. Filtrá, ordená y gestioná tu historial.",
  robots: { index: false },
};

export default function DashboardPage() {
  return <DashboardView />;
}
