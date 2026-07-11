export function formatDate(value: string | Date, locale = "es-AR"): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString(locale, { timeZone: "UTC" });
}
