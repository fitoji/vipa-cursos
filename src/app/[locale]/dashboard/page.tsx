import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DashboardClient } from "./dashboard-client";
import { canonicalFor, languageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = (await getTranslations("DashboardPage.meta")) as any;
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false },
    alternates: {
      canonical: canonicalFor(locale, "/dashboard"),
      languages: languageAlternates("dashboard"),
    },
  };
}

export default function DashboardPage() {
  return <DashboardClient />;
}
