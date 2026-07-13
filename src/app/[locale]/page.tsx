import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LandingView } from "@/components/landing-view";
import { canonicalFor, languageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = (await getTranslations("HomePage.meta")) as any;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: canonicalFor(locale),
      languages: languageAlternates(),
    },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "es_AR",
      url: canonicalFor(locale),
      siteName: "VipaBase",
      title: t("title"),
      description: t("description"),
    },
    twitter: {
      card: "summary",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default function Home() {
  return <LandingView />;
}
