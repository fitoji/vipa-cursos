"use client";

import { Link } from "@/i18n/navigation";
import {
  BookOpen,
  Clock,
  BarChart3,
  Flame,
  Upload,
  MessageSquare,
  FileText,
  ChevronRight,
  Sparkles,
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
  {
    id: "intro",
    icon: BookOpen,
    contentKeys: {
      title: "sections.intro.title",
      intro: "sections.intro.intro",
      items: [
        "sections.intro.item1",
        "sections.intro.item2",
        "sections.intro.item3",
        "sections.intro.item4",
        "sections.intro.item5",
      ],
    },
  },
  {
    id: "courses",
    icon: Clock,
    contentKeys: {
      title: "sections.courses.title",
      steps: [
        "sections.courses.step1",
        "sections.courses.step2",
        "sections.courses.step3",
        "sections.courses.step4",
        "sections.courses.step5",
        "sections.courses.step6",
        "sections.courses.step7",
        "sections.courses.step8",
        "sections.courses.step9",
        "sections.courses.step10",
      ],
      faq: {
        title: "sections.courses.faq.title",
        q1: "sections.courses.faq.q1",
        a1: "sections.courses.faq.a1",
        q2: "sections.courses.faq.q2",
        a2: "sections.courses.faq.a2",
      },
    },
  },
  {
    id: "dashboard",
    icon: BarChart3,
    contentKeys: {
      title: "sections.dashboard.title",
      intro: "sections.dashboard.intro",
      items: [
        "sections.dashboard.item1",
        "sections.dashboard.item2",
        "sections.dashboard.item3",
        "sections.dashboard.item4",
      ],
    },
  },
  {
    id: "racha",
    icon: Flame,
    contentKeys: {
      title: "sections.racha.title",
      intro: "sections.racha.intro",
      items: [
        "sections.racha.item1",
        "sections.racha.item2",
        "sections.racha.item3",
        "sections.racha.item4",
      ],
    },
  },
  {
    id: "chatgpt",
    icon: Sparkles,
    contentKeys: {
      title: "sections.chatgpt.title",
      intro: "sections.chatgpt.intro",
      steps: [
        "sections.chatgpt.step1",
        "sections.chatgpt.step2",
        "sections.chatgpt.step3",
        "sections.chatgpt.step4",
        "sections.chatgpt.step5",
        "sections.chatgpt.step6",
      ],
      tip: "sections.chatgpt.tip",
    },
  },
  {
    id: "export",
    icon: Upload,
    contentKeys: {
      title: "sections.export.title",
      intro: "sections.export.intro",
      steps: [
        "sections.export.step1",
        "sections.export.step2",
        "sections.export.step3",
      ],
    },
  },
];

function SectionIcon({ icon: Icon }: { icon: typeof BookOpen }) {
  return <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />;
}

export function HelpView() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useTranslations("HelpPage") as any;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Quick nav */}
      <nav aria-label={t("navLabel")} className="mb-12 rounded-lg border bg-card p-4 sm:p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("navLabel")}
        </h2>
        <ul className="space-y-2">
          {sections.map((s) => (
            <li key={s.id}>
              <Link
                href={`#${s.id}`}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <SectionIcon icon={s.icon} />
                <span>{t(s.contentKeys.title)}</span>
                <ChevronRight className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Section: Introducción */}
      <section id="intro" className="mb-16 scroll-mt-20" aria-label={t("sections.intro.title")}>
        <div className="mb-6 flex items-center gap-3">
          <SectionIcon icon={BookOpen} />
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            {t("sections.intro.title")}
          </h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <p>{t("sections.intro.intro")}</p>
          <ul className="list-disc space-y-2 pl-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i}>{t(`sections.intro.item${i + 1}`)}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Section: Cursos */}
      <section id="courses" className="mb-16 scroll-mt-20" aria-label={t("sections.courses.title")}>
        <div className="mb-6 flex items-center gap-3">
          <SectionIcon icon={Clock} />
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
                <AccordionTrigger className="text-sm">{t("sections.courses.faq.q1")}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {t("sections.courses.faq.a1")}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger className="text-sm">{t("sections.courses.faq.q2")}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {t("sections.courses.faq.a2")}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Section: Dashboard */}
      <section id="dashboard" className="mb-16 scroll-mt-20" aria-label={t("sections.dashboard.title")}>
        <div className="mb-6 flex items-center gap-3">
          <SectionIcon icon={BarChart3} />
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            {t("sections.dashboard.title")}
          </h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <p>{t("sections.dashboard.intro")}</p>
          <ul className="list-disc space-y-2 pl-5">
            {[1, 2, 3, 4].map((i) => (
              <li key={i}>{t(`sections.dashboard.item${i}`)}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Section: Racha */}
      <section id="racha" className="mb-16 scroll-mt-20" aria-label={t("sections.racha.title")}>
        <div className="mb-6 flex items-center gap-3">
          <SectionIcon icon={Flame} />
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

      {/* Section: ChatGPT */}
      <section id="chatgpt" className="mb-16 scroll-mt-20" aria-label={t("sections.chatgpt.title")}>
        <div className="mb-6 flex items-center gap-3">
          <SectionIcon icon={Sparkles} />
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

          <div className="mt-6 rounded-lg border bg-muted/50 p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{t("sections.chatgpt.tipTitle")}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("sections.chatgpt.tip")}</p>
          </div>
        </div>
      </section>

      {/* Section: Exportar / Importar */}
      <section id="export" className="mb-16 scroll-mt-20" aria-label={t("sections.export.title")}>
        <div className="mb-6 flex items-center gap-3">
          <SectionIcon icon={Upload} />
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            {t("sections.export.title")}
          </h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <p>{t("sections.export.intro")}</p>
          <ol className="list-decimal space-y-3 pl-5">
            {[1, 2, 3].map((i) => (
              <li key={i}>{t(`sections.export.step${i}`)}</li>
            ))}
          </ol>

          <div className="mt-8 flex gap-4">
            <Button asChild variant="outline">
              <Link href="/cursos">{t("cta.courses")}</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">{t("cta.dashboard")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
