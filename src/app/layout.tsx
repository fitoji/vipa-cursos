import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";

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

export const metadata: Metadata = {
  title: "Mis cursos de Vipassana",
  description: "Registro personal de cursos de meditación Vipassana.",
  authors: [{ name: "Vipassana Tracker" }],
  icons: {
    icon: "/favicon.png",
  },
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
    <html
      lang="en"
      className={`${montserrat.variable} ${playfair.variable} ${sourceCode.variable}`}
    >
      <body>
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
