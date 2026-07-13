import type { Metadata, Viewport } from "next";
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
import { SiteJsonLd } from "@/components/site-json-ld";
import { canonicalFor, languageAlternates } from "@/lib/seo";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vipabase.vercel.app";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#6C47FF",
};

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
      template: "%s | VipaBase",
    },
    description: t("description"),
    authors: [{ name: "VipaBase" }],
    creator: "VipaBase",
    icons: {
      icon: [
        { url: "/favicon.png", type: "image/png", sizes: "32x32" },
        { url: "/icons8-dharma-wheel-32.png", type: "image/png", sizes: "32x32" },
      ],
      apple: "/favicon.png",
    },
    manifest: "/site.webmanifest",
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      languages: {
        es: "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "es_AR",
      url: basePath ? `${siteUrl}/en` : siteUrl,
      siteName: "VipaBase",
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
      <body className="flex h-screen flex-col overflow-hidden">
        <SiteJsonLd />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <SiteHeader />
            <main className="flex-1 overflow-y-auto">{children}</main>
            <SiteFooter />
          </Providers>
          <Toaster richColors position="bottom-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
