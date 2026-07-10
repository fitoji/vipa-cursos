import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const sourceCode = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vipa-cursos.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vipa Cursos — Registro de Cursos de Vipassana",
    template: "%s | Vipa Cursos",
  },
  description:
    "App personal para registrar y organizar tus cursos de meditación Vipassana. Guarda fechas, lugares, profesores y duración de cada sit y serve.",
  authors: [{ name: "Vipa Cursos" }],
  creator: "Vipa Cursos",
  icons: {
    icon: "/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "Vipa Cursos",
    title: "Vipa Cursos — Registro de Cursos de Vipassana",
    description: "App personal para registrar y organizar tus cursos de meditación Vipassana.",
  },
  twitter: {
    card: "summary",
    title: "Vipa Cursos — Registro de Cursos de Vipassana",
    description: "App personal para registrar y organizar tus cursos de meditación Vipassana.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${playfair.variable} ${sourceCode.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
