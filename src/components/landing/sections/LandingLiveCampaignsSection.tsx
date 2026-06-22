import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/locales";
import { LandingCampaignCard } from "../LandingCampaignCard";
import { LandingSection } from "../LandingSection";
import type { LandingCampaign, LandingCopy, LandingTheme } from "../types";

type LandingLiveCampaignsSectionProps = {
  locale: Locale;
  t: LandingCopy;
  theme: LandingTheme;
  campaigns: LandingCampaign[];
  isLoading: boolean;
};

export function LandingLiveCampaignsSection({
  locale,
  t,
  theme,
  campaigns,
  isLoading,
}: LandingLiveCampaignsSectionProps) {
  const { card } = theme;

  return (
    <LandingSection theme={theme} className="py-16">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.liveCampaignsTitle}</h2>
          <Link
            href="/discovery"
            className="inline-flex w-fit items-center gap-1 text-sm font-bold text-primary-700 transition hover:text-primary-600 dark:text-primary-400"
          >
            {t.liveCampaignsViewAll}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={clsx(card, "h-[22rem] animate-pulse")} aria-hidden />
              ))
            : campaigns.map((campaign) => (
                <LandingCampaignCard key={campaign.id} campaign={campaign} locale={locale} t={t} theme={theme} />
              ))}
        </div>
      </div>
    </LandingSection>
  );
}
