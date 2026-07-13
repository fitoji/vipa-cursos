import type { Metadata } from "next";
import { CursosView } from "@/components/cursos-view";

export const metadata: Metadata = {
  robots: { index: false },
};

export default function CursosPage() {
  return <CursosView />;
}
