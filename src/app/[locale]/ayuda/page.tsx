import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HelpView } from "@/components/help-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HelpPage");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default function HelpPage() {
  return <HelpView />;
}
