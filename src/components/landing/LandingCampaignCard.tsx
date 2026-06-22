import clsx from "clsx";
import Link from "next/link";
import type { Locale } from "@/locales";
import { formatEtb } from "./utils";
import type { LandingCampaign, LandingCopy, LandingTheme } from "./types";

type LandingCampaignCardProps = {
  campaign: LandingCampaign;
  locale: Locale;
  t: LandingCopy;
  theme: LandingTheme;
};

export function LandingCampaignCard({ campaign, locale, t, theme }: LandingCampaignCardProps) {
  const { isDark, card, muted } = theme;

  return (
    <Link
      href={campaign.href}
      className={clsx(card, "group flex flex-col overflow-hidden transition hover:-translate-y-0.5")}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote campaign imagery */}
        <img
          src={campaign.image}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
          {t.liveBadge}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className={clsx("text-xs font-medium", muted)}>
          {campaign.categoryLabel} • {campaign.location}
        </p>
        <h3 className="mt-1.5 text-lg font-bold leading-snug">{campaign.title}</h3>
        <div className="mt-4">
          <div className={clsx("h-1.5 w-full overflow-hidden rounded-full", isDark ? "bg-zinc-800" : "bg-zinc-200")}>
            <div className="h-full rounded-full bg-primary-600" style={{ width: `${campaign.fundedPercent}%` }} />
          </div>
          <div className={clsx("mt-2 flex items-center justify-between text-xs font-semibold", muted)}>
            <span>
              {campaign.fundedPercent}% {t.fundedLabel}
            </span>
            <span>
              {campaign.daysRemaining} {t.daysLeftLabel}
            </span>
          </div>
        </div>
        <div
          className={clsx(
            "mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-xs",
            isDark ? "border-white/10" : "border-zinc-100",
          )}
        >
          <div>
            <p className={clsx("font-bold uppercase tracking-wide", muted)}>{t.raisedLabel}</p>
            <p className="mt-0.5 text-sm font-bold text-primary-800 dark:text-primary-300">
              {formatEtb(campaign.raisedEtb, locale)} ETB
            </p>
          </div>
          <div>
            <p className={clsx("font-bold uppercase tracking-wide", muted)}>{t.minInvestLabel}</p>
            <p className="mt-0.5 text-sm font-bold text-primary-800 dark:text-primary-300">
              {formatEtb(campaign.minInvestEtb, locale)} ETB
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
