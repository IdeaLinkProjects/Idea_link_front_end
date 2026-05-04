import type { Locale } from "@/locales";

export function formatEtb(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "am" ? "am-ET" : "en-ET", { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  );
}
