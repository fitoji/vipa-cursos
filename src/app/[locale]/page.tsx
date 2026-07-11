import type { Metadata } from "next";
import { LandingView } from "@/components/landing-view";

export const metadata: Metadata = {
  title: "Vipa Cursos — Tu registro personal de cursos de Vipassana",
  description:
    "Guardá cada curso sentado (sit) y de servicio (serve) de meditación Vipassana en un solo lugar.",
};

export default function Home() {
  return <LandingView />;
}
