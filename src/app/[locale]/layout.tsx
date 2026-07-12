import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Source_Code_Pro } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "../providers";
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === "en" ? "/en" : "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = (await getTranslations("layout.meta")) as any;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("title"),
      template: "%s | Vipa Cursos",
    },
    description: t("description"),
    authors: [{ name: "Vipa Cursos" }],
    creator: "Vipa Cursos",
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      ],
      apple: "/favicon.png",
    },
    manifest: "/site.webmanifest",
    other: {
      "theme-color": "#6C47FF",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      languages: {
        es: "/",
        en: "/en",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "es_AR",
      url: basePath ? `${siteUrl}/en` : siteUrl,
      siteName: "Vipa Cursos",
      title: t("title"),
      description: t("ogDescription"),
    },
    twitter: {
      card: "summary",
      title: t("title"),
      description: t("ogDescription"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${montserrat.variable} ${playfair.variable} ${sourceCode.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </Providers>
          <Toaster richColors position="bottom-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
