"use client";

import Link from "next/link";
import { BookOpen, Clock, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInView, staggerDelay } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const features = [
  {
    icon: BookOpen,
    title: "Registra cada curso",
    description: "Fecha, lugar, profesor, país, modo (sit o serve) y duración.",
  },
  {
    icon: Clock,
    title: "Historial completo",
    description: "Visualizá todos los cursos que has realizado en un solo lugar.",
  },
  {
    icon: BarChart3,
    title: "Panel de control",
    description: "Filtrá, ordená y buscá entre tus cursos con una tabla interactiva.",
  },
  {
    icon: Shield,
    title: "Privado y seguro",
    description: "Solo vos podés ver tus datos. Autenticación con Google o email.",
  },
];

export function LandingView() {
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session;
  const [heroRef, heroInView] = useInView(0.1);
  const [featuresRef, featuresInView] = useInView(0.1);
  const [ctaRef, ctaInView] = useInView(0.2);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — hero.jpg as background */}
      <section
        className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 py-24"
        style={{
          backgroundImage: "url('/hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        <div ref={heroRef} className="relative z-10 mx-auto max-w-2xl text-center">
          <h1
            className={cn(
              "text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl",
              heroInView && "anim-fade-up",
            )}
            style={heroInView ? staggerDelay(1) : undefined}
          >
            Vipa <span className="text-primary">Cursos</span>
          </h1>
          <p
            className={cn(
              "mt-4 text-lg text-white/80 drop-shadow",
              heroInView && "anim-fade-up",
            )}
            style={heroInView ? staggerDelay(2) : undefined}
          >
            Tu registro personal de cursos de meditación Vipassana. Guardá cada sit y serve, y
            revisá tu camino cuando lo necesites.
          </p>
          <div
            className={cn(
              "mt-8 flex items-center justify-center gap-4",
              heroInView && "anim-fade-up",
            )}
            style={heroInView ? staggerDelay(3) : undefined}
          >
            {isLoggedIn ? (
              <>
                <Button size="lg" className="hover-scale" asChild>
                  <Link href="/dashboard">Panel de control</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/cursos">Nuevo curso</Link>
                </Button>
              </>
            ) : (
              <Button size="lg" className="hover-scale" asChild>
                <Link href="/login">Empezar ahora</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features — bosque.webp as subtle background */}
      <section
        className="relative border-t px-4 py-24"
        style={{
          backgroundImage: "url('/bosque.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Soft overlay so cards remain readable */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
        <div ref={featuresRef} className="relative z-10 mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight">
            Todo lo que necesitás
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((f, i) => (
              <Card
                key={f.title}
                className={cn(
                  "hover-lift border-white/10 bg-white/90 shadow-lg backdrop-blur-sm dark:bg-black/80",
                  featuresInView && "anim-fade-up",
                )}
                style={featuresInView ? staggerDelay(i) : undefined}
              >
                <CardContent className="flex gap-4 p-6">
                  <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-medium">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — hidden when logged in */}
      {!isLoggedIn && (
        <section className="px-4 py-24 text-center">
          <div ref={ctaRef} className="mx-auto max-w-lg">
            <img
              src="/pagoda.webp"
              alt="Pagoda Vipassana"
              className={cn(
                "mx-auto mb-6 h-36 w-36 rounded-full object-cover shadow-lg",
                ctaInView && "anim-fade-up",
              )}
            />
            <h2
              className={cn("text-2xl font-semibold tracking-tight", ctaInView && "anim-fade-up")}
              style={ctaInView ? staggerDelay(1) : undefined}
            >
              Caminá tu camino con atención
            </h2>
            <p
              className={cn("mt-2 text-muted-foreground", ctaInView && "anim-fade-up")}
              style={ctaInView ? staggerDelay(2) : undefined}
            >
              Llevá registro de tu práctica de Vipassana de forma simple y organizada.
            </p>
            <Button
              size="lg"
              className={cn("mt-6 hover-scale", ctaInView && "anim-fade-up")}
              style={ctaInView ? staggerDelay(3) : undefined}
              asChild
            >
              <Link href="/login">Registrarse gratis</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
