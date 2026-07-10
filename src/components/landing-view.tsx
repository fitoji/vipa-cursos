"use client";

import Link from "next/link";
import { BookOpen, Clock, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function PenguinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Body */}
      <ellipse cx="32" cy="38" rx="18" ry="22" fill="currentColor" className="text-foreground" />
      {/* Belly */}
      <ellipse cx="32" cy="40" rx="11" ry="16" fill="currentColor" className="text-primary" />
      {/* Head */}
      <circle cx="32" cy="18" r="12" fill="currentColor" className="text-foreground" />
      {/* Eyes */}
      <circle cx="27" cy="16" r="2.5" fill="currentColor" className="text-background" />
      <circle cx="37" cy="16" r="2.5" fill="currentColor" className="text-background" />
      <circle cx="27.5" cy="15.5" r="1" fill="currentColor" className="text-foreground" />
      <circle cx="37.5" cy="15.5" r="1" fill="currentColor" className="text-foreground" />
      {/* Beak */}
      <path d="M29 21 L32 26 L35 21 Z" fill="currentColor" className="text-accent" />
      {/* Left flipper */}
      <path d="M14 32 Q8 38 12 48 Q16 44 18 38 Z" fill="currentColor" className="text-foreground" />
      {/* Right flipper */}
      <path
        d="M50 32 Q56 38 52 48 Q48 44 46 38 Z"
        fill="currentColor"
        className="text-foreground"
      />
      {/* Feet */}
      <ellipse cx="26" cy="58" rx="5" ry="2.5" fill="currentColor" className="text-accent" />
      <ellipse cx="38" cy="58" rx="5" ry="2.5" fill="currentColor" className="text-accent" />
    </svg>
  );
}

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
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-24 text-center">
        <div className="mx-auto max-w-2xl">
          <PenguinIcon className="mx-auto mb-6 h-28 w-28 drop-shadow-lg" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Vipa <span className="text-primary">Cursos</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Tu registro personal de cursos de meditación Vipassana. Guardá cada sit y serve, y
            revisá tu camino cuando lo necesites.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/login">Empezar ahora</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/cursos">Ir a mis cursos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight">
            Todo lo que necesitás
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <Card key={f.title}>
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

      {/* CTA */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-lg">
          <PenguinIcon className="mx-auto mb-4 h-12 w-12 opacity-60" />
          <h2 className="text-2xl font-semibold tracking-tight">Caminá tu camino con atención</h2>
          <p className="mt-2 text-muted-foreground">
            Llevá registro de tu práctica de Vipassana de forma simple y organizada.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/login">Registrarse gratis</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
