import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // Let next-intl resolve the locale first.
  // If it returns a redirect response, pass it through immediately.
  const response = handleI18nRouting(request);
  if (!response.ok) return response;

  // Auth checks with locale-preserving redirects.
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Extract the active locale from the pathname.
  // Handles both prefixed (/en/…) and unprefixed (Spanish default) URLs.
  const locale =
    routing.locales.find((loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`) ??
    routing.defaultLocale;

  const isDashboard =
    pathname === "/dashboard" ||
    pathname === `/${locale}/dashboard` ||
    pathname.endsWith("/dashboard");

  const isLogin =
    pathname === "/login" || pathname === `/${locale}/login` || pathname.endsWith("/login");

  // Redirect unauthenticated users away from dashboard
  if (!sessionCookie && isDashboard) {
    const target = locale === routing.defaultLocale ? "/login" : `/${locale}/login`;
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Redirect authenticated users away from login
  if (sessionCookie && isLogin) {
    const target = locale === routing.defaultLocale ? "/cursos" : `/${locale}/cursos`;
    return NextResponse.redirect(new URL(target, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
