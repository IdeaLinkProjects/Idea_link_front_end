import type { Locale } from "@/locales";

export function formatCurrency(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "am" ? "am-ET" : "en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatCompactCurrency(value: number, locale: Locale) {
  const n = value || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M ETB`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K ETB`;
  return formatCurrency(n, locale);
}

export function formatDate(isoDate: string, locale: Locale) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString(locale === "am" ? "am-ET" : "en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(isoDate: string, locale: Locale) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString(locale === "am" ? "am-ET" : "en-ET", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSignedAmount(value: number, locale: Locale) {
  const abs = Math.abs(value);
  const formatted = formatCurrency(abs, locale);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}
