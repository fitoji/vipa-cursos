"use client";

import { TransitionLink as Link } from "@/components/transition-link";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  BarChart3,
  Flame,
  Upload,
  MessageSquare,
  Sparkles,
  Heart,
  Image,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sections = [
  { id: "intro", icon: BookOpen },
  { id: "courses", icon: Clock },
  { id: "dashboard", icon: BarChart3 },
  { id: "racha", icon: Flame },
  { id: "background", icon: Image },
  { id: "chatgpt", icon: Sparkles },
  { id: "export", icon: Upload },
  { id: "attributions", icon: Heart },
];

function SectionIcon({ icon: Icon }: { icon: typeof BookOpen }) {
  return <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />;
}

export function HelpView() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useTranslations("HelpPage") as any;

  return (
    <div className="relative h-full">
      {/* gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "var(--help-gradient)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Back to dashboard */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {t("backToDashboard")}
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Quick nav — icons + text, no chevron */}
        <nav aria-label={t("navLabel")} className="mb-14">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {sections.map((s) => (
              <li key={s.id}>
                <Link
                  href={`#${s.id}`}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  <SectionIcon icon={s.icon} />
                  <span>{t(`sections.${s.id}.title`)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Section: Introducción — text only */}
        <section id="intro" className="mb-12 scroll-mt-4" aria-label={t("sections.intro.title")}>
          <h2 className="mb-4 font-serif text-2xl font-semibold tracking-tight">
            {t("sections.intro.title")}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>{t("sections.intro.intro")}</p>
            <ul className="list-disc space-y-2 pl-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i}>{t(`sections.intro.item${i + 1}`)}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section: Cursos — icon inline */}
        <section
          id="courses"
          className="mb-16 scroll-mt-4"
          aria-label={t("sections.courses.title")}
        >
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <h2 className="font-serif text-2xl font-semibold tracking-tight">
              {t("sections.courses.title")}
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <ol className="list-decimal space-y-3 pl-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <li key={i}>{t(`sections.courses.step${i}`)}</li>
              ))}
            </ol>

            <div className="mt-8">
              <h3 className="mb-3 font-serif text-lg font-medium text-foreground">
                {t("sections.courses.faq.title")}
              </h3>
              <Accordion type="single" collapsible className="border-t">
                <AccordionItem value="q1">
                  <AccordionTrigger className="text-sm">
                    {t("sections.courses.faq.q1")}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {t("sections.courses.faq.a1")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Section: Dashboard — no icon */}
        <section
          id="dashboard"
          className="mb-12 scroll-mt-4"
          aria-label={t("sections.dashboard.title")}
        >
          <h2 className="mb-4 font-serif text-2xl font-semibold tracking-tight">
            {t("sections.dashboard.title")}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>{t("sections.dashboard.intro")}</p>
            <ul className="list-disc space-y-2 pl-5">
              {[1, 2, 3, 4].map((i) => (
                <li key={i}>{t(`sections.dashboard.item${i}`)}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section: Racha — icon inline */}
        <section id="racha" className="mb-14 scroll-mt-4" aria-label={t("sections.racha.title")}>
          <div className="mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <h2 className="font-serif text-2xl font-semibold tracking-tight">
              {t("sections.racha.title")}
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>{t("sections.racha.intro")}</p>
            <ul className="list-disc space-y-2 pl-5">
              {[1, 2, 3, 4].map((i) => (
                <li key={i}>{t(`sections.racha.item${i}`)}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section: ChatGPT — distinct callout */}
        <section
          id="chatgpt"
          className="mb-16 scroll-mt-4"
          aria-label={t("sections.chatgpt.title")}
        >
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-serif text-2xl font-semibold tracking-tight">
                {t("sections.chatgpt.title")}
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>{t("sections.chatgpt.intro")}</p>
              <ol className="list-decimal space-y-3 pl-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <li key={i}>{t(`sections.chatgpt.step${i}`)}</li>
                ))}
              </ol>

              <div className="mt-4 rounded-lg bg-muted/50 p-4">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
                  <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>{t("sections.chatgpt.tipTitle")}</span>
                </div>
                <p className="text-sm text-muted-foreground">{t("sections.chatgpt.tip")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Exportar / Importar — no icon */}
        <section id="export" className="scroll-mt-4" aria-label={t("sections.export.title")}>
          <h2 className="mb-4 font-serif text-2xl font-semibold tracking-tight">
            {t("sections.export.title")}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>{t("sections.export.intro")}</p>
            <ol className="list-decimal space-y-3 pl-5">
              {[1, 2, 3].map((i) => (
                <li key={i}>{t(`sections.export.step${i}`)}</li>
              ))}
            </ol>
          </div>
        </section>

        {/* Section: Background — icon inline */}
        <section
          id="background"
          className="mb-12 scroll-mt-4"
          aria-label={t("sections.background.title")}
        >
          <div className="mb-4 flex items-center gap-2">
            <Image className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <h2 className="font-serif text-2xl font-semibold tracking-tight">
              {t("sections.background.title")}
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>{t("sections.background.intro")}</p>
            <ol className="list-decimal space-y-3 pl-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <li key={i}>{t(`sections.background.step${i}`)}</li>
              ))}
            </ol>
          </div>
        </section>

        {/* Section: Atribuciones — icon inline */}
        <section
          id="attributions"
          className="mt-16 scroll-mt-4"
          aria-label={t("sections.attributions.title")}
        >
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <h2 className="font-serif text-2xl font-semibold tracking-tight">
              {t("sections.attributions.title")}
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>{t("sections.attributions.intro")}</p>

            <div className="rounded-lg border bg-card/50 p-4">
              <h3 className="mb-3 font-medium text-foreground">
                {t("sections.attributions.title")}
              </h3>
              <ul className="space-y-2">
                {(
                  ["forest", "bodhiLeaf", "sacredLeaves", "sacredFig"] as const
                ).map((key) => (
                  <li key={key} className="flex items-center justify-between">
                    <span>
                      {t(`sections.attributions.images.${key}.name`)}
                      <span className="ml-2 text-xs text-muted-foreground">
                        — {t(`sections.attributions.images.${key}.author`)}
                      </span>
                    </span>
                    <a
                      href={
                        key === "forest"
                          ? "https://unsplash.com/photos/upR8raSXvwg"
                          : key === "bodhiLeaf"
                            ? "https://pixabay.com/photos/bodhi-leaf-leaf-buddhism-bodhi-5213739/"
                            : key === "sacredLeaves"
                              ? "https://pixabay.com/photos/leaves-bo-leaf-tree-foliage-bodhi-6636814/"
                              : "https://pixabay.com/photos/sacred-fig-bo-tree-leaves-foliage-6656594/"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline-offset-4 hover:underline"
                    >
                      {t(`sections.attributions.images.${key}.source`)}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                {t("sections.attributions.license")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                <a
                  href="https://icons8.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {t("sections.attributions.icons8")}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* CTA buttons */}
        <div className="mt-12 flex gap-4">
          <Button asChild variant="outline">
            <Link href="/cursos">{t("cta.courses")}</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">{t("cta.dashboard")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
