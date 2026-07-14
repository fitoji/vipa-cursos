import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { canonicalFor, languageAlternates } from "@/lib/seo";
import MeditationStreakTracker from "@/components/MeditationStreakTracker";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = (await getTranslations("Racha.meta")) as any;
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false },
    alternates: {
      canonical: canonicalFor(locale, "/racha"),
      languages: languageAlternates("racha"),
    },
  };
}

export default function RachaPage() {
  return <MeditationStreakTracker />;
}
