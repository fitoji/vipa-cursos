import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description:
    "Accedé a tu cuenta de Vipa Cursos para registrar y organizar tus cursos de meditación Vipassana.",
  robots: { index: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
