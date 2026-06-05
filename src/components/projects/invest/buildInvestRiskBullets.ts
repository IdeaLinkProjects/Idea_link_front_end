import type { PublicProjectBundle } from "@/lib/campaign/fromMyCampaign";
import { riskBulletsFromText } from "@/lib/project-detail/riskBulletsFromText";
import type { Locale } from "@/locales";

export function buildInvestRiskBullets(bundle: PublicProjectBundle, locale: Locale): string[] {
  const base = riskBulletsFromText(bundle.risksDisclosure, 4);
  const extra = [
    `${locale === "am" ? "ደረጃ" : "Risk level"}: ${bundle.riskLevel} — ${bundle.riskLevelExplanation}`,
    bundle.investorConsiderations,
  ];
  return [...base, ...extra].filter(Boolean).slice(0, 6);
}
