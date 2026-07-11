import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // This will be called by the next-intl plugin both at build time
  // (for static generation) and at request time (for dynamic rendering).
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // Messages will be loaded from JSON catalogs in Phase 3.
    // Phase 1 returns empty messages — no components use useTranslations yet.
    messages: {},
  };
});
