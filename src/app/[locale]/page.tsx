import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LandingView } from "@/components/landing-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = (await getTranslations("HomePage.meta")) as any;

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function Home() {
  return <LandingView />;
}
