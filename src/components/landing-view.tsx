"use client";

import { TransitionLink as Link } from "@/components/transition-link";
import { BookOpen, Clock, BarChart3, BookText, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInView, staggerDelay } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

const features = [
  {
    icon: BookOpen,
    titleKey: "features.items.register.title",
    descriptionKey: "features.items.register.description",
  },
  {
    icon: Clock,
    titleKey: "features.items.history.title",
    descriptionKey: "features.items.history.description",
  },
  {
    icon: BarChart3,
    titleKey: "features.items.dashboard.title",
    descriptionKey: "features.items.dashboard.description",
  },
  {
    icon: Flame,
    titleKey: "features.items.streak.title",
    descriptionKey: "features.items.streak.description",
  },
  {
    icon: BookText,
    titleKey: "features.items.help.title",
    descriptionKey: "features.items.help.description",
  },
];

export function LandingView() {
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session;
  const [heroRef, heroInView] = useInView(0.1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useTranslations("Landing") as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tc = useTranslations("common") as any;

  return (
    <div className="h-full bg-background">
      {/* Hero — hero.jpg as background */}
      <section
        className="relative flex h-full items-center overflow-hidden"
        aria-label={t("aria.hero")}
        style={{
          backgroundImage: "url('/hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div ref={heroRef} className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
          <div className="max-w-xl">
            <h1
              className={cn(
                "font-serif text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl",
                heroInView && "anim-fade-up",
              )}
              style={heroInView ? staggerDelay(1) : undefined}
            >
              {t("hero.title")}
            </h1>
            <p
              className={cn(
                "mt-4 text-lg leading-relaxed text-white/90 drop-shadow",
                heroInView && "anim-fade-up",
              )}
              style={heroInView ? staggerDelay(2) : undefined}
            >
              {t("hero.subtitle")}
            </p>
            <div
              className={cn("mt-8 flex items-center gap-4", heroInView && "anim-fade-up")}
              style={heroInView ? staggerDelay(3) : undefined}
            >
              {isLoggedIn ? (
                <>
                  <Button size="lg" render={<Link href="/dashboard">
                      <span className="shimmer shimmer-color-white/80">
                        {t("hero.loggedInCta")}
                      </span>
                    </Link>} />
                  <Button size="lg" variant="outline" render={<Link href="/cursos">
                      <span className="shimmer shimmer-color-primary/80">
                        {t("hero.newCourse")}
                      </span>
                    </Link>} />
                </>
              ) : (
                <>
                  <Button size="lg" variant="outline" render={<Link href="/login">
                      <span className="shimmer shimmer-color-primary-foreground/80">
                        {t("hero.signIn")}
                      </span>
                    </Link>} />
                  <Button size="lg" render={<Link href="/login">
                      <span className="shimmer shimmer-color-white/80">{t("hero.signUp")}</span>
                    </Link>} />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features — bosque.webp as subtle background */}
      <section
        className="relative border-t"
        aria-label={t("aria.features")}
        style={{
          backgroundImage: "url('/background/bosque.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Soft overlay so cards remain readable */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <h2 className="mb-12 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("features.heading")}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {features.map((f) => {
              const card = (
                <Card
                  className={cn(
                    "hover-lift border-white/10 bg-white/90 shadow-lg backdrop-blur-sm dark:bg-card/80",
                    f.icon === BookText &&
                      "cursor-pointer transition-colors hover:bg-white/70 dark:hover:bg-card/60",
                  )}
                >
                  <CardContent className="flex gap-4 p-6">
                    <f.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <h3 className="font-serif font-medium">{t(f.titleKey)}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {t(f.descriptionKey)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );

              return f.icon === BookText ? (
                <Link key={f.titleKey} href="/ayuda" className="block">
                  {card}
                </Link>
              ) : (
                <div key={f.titleKey}>{card}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA — hidden when logged in */}
      {!isLoggedIn && (
        <section className="border-t" aria-label={t("aria.cta")}>
          <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
            <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
              <img
                src="/pagoda.webp"
                alt={t("cta.alt")}
                className="size-28 shrink-0 rounded-full object-cover shadow-lg sm:h-36 sm:w-36"
              />
              <div className="text-left">
                <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                  {t("cta.title")}
                </h2>
                <p className="mt-2 max-w-md text-muted-foreground">{t("cta.description")}</p>
                <Button size="lg" className="mt-6 hover:bg-primary/90" render={<Link href="/login">{t("cta.button")}</Link>} />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
