import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/login-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = (await getTranslations("LoginPage.meta")) as any;

  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false },
  };
}

export default function LoginPage() {
  return <LoginForm />;
}
