import type { MetadataRoute } from "next";

const locales = ["es", "en"];
const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vipabase.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const pages = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/login", changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  for (const page of pages) {
    const alternates: Record<string, string> = {};
    for (const locale of locales) {
      const prefix = locale === "es" ? "" : `/${locale}`;
      alternates[locale] = `${base}${prefix}${page.path}`;
    }

    for (const locale of locales) {
      const prefix = locale === "es" ? "" : `/${locale}`;
      entries.push({
        url: `${base}${prefix}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
