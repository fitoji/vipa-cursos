import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Mis cursos de Vipassana",
  description: "Registro personal de cursos de meditación Vipassana.",
  authors: [{ name: "Vipassana Tracker" }],
  openGraph: {
    title: "Mis cursos de Vipassana",
    description: "Registro personal de cursos de meditación Vipassana.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
