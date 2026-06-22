import type { Locale } from "@/locales";
import { messages } from "@/locales";
import type { MyCampaign } from "@/store";
import { DEFAULT_CAMPAIGN_IMAGE } from "./constants";
import type { LandingCampaign } from "./types";

type FallbackCampaign = (typeof messages.en.landing)["featuredCampaigns"][number];

export function discoveryHref(keyword?: string): string {
  const q = keyword?.trim();
  return q ? `/discovery?q=${encodeURIComponent(q)}` : "/discovery";
}

export function formatEtb(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "am" ? "am-ET" : "en-ET", { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  );
}

export function daysRemaining(iso: string): number {
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

export function campaignFromApi(c: MyCampaign): LandingCampaign {
  const tag = c.tags?.[0] ?? "";
  const categoryLabel = tag || c.company?.industry || "—";
  return {
    id: String(c.id),
    title: c.title,
    categoryLabel,
    location: c.company?.name ?? "Ethiopia",
    fundedPercent: Math.min(100, Math.max(0, Math.round(c.fundingProgress ?? 0))),
    daysRemaining: daysRemaining(c.endDate),
    raisedEtb: c.amountRaised ?? 0,
    minInvestEtb: c.minInvestment ?? 0,
    image: c.heroImageUrl?.trim() || DEFAULT_CAMPAIGN_IMAGE,
    href: `/projects/${c.id}`,
  };
}

export function campaignFromFallback(c: FallbackCampaign): LandingCampaign {
  return {
    id: c.title,
    title: c.title,
    categoryLabel: c.category,
    location: c.location,
    fundedPercent: c.fundedPercent,
    daysRemaining: c.daysRemaining,
    raisedEtb: c.raisedEtb,
    minInvestEtb: c.minInvestEtb,
    image: c.image,
    href: "/discovery",
  };
}

export function initialsFromName(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}
