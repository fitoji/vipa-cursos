import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("NotFoundPage");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">{t("code")}</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("message")}</p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/">{t("goHome")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
