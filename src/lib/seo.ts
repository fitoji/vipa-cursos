export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vipabase.vercel.app";

export function localePrefix(locale: string): string {
  return locale === "en" ? "/en" : "";
}

export function canonicalFor(locale: string, path = ""): string {
  return `${siteUrl}${localePrefix(locale)}${path}`;
}

export function languageAlternates(path = ""): Record<string, string> {
  return path
    ? { es: `/${path}`, en: `/en/${path}`, "x-default": `/${path}` }
    : { es: "/", en: "/en", "x-default": "/" };
}
