import Link from "next/link";
import type { Locale } from "@/locales";
import type { messages } from "@/locales";
import type { MyCampaign } from "@/store";
import { SaveCampaignButton } from "./SaveCampaignButton";
import { daysRemaining, formatDateShort, formatEtb } from "./discoveryFormatters";
import type { DiscoveryCopy, DiscoveryFilterUi, SaveCampaignLabels } from "./types";

type CampaignListRowProps = {
  campaign: MyCampaign;
  locale: Locale;
  isDark: boolean;
  filterUi: DiscoveryFilterUi;
  copy: DiscoveryCopy;
  featured: (typeof messages.en.featured);
  muted: string;
  linkPrimary: string;
  saveLabels: SaveCampaignLabels;
};

export function CampaignListRow({
  campaign,
  locale,
  isDark,
  filterUi: fu,
  copy,
  featured,
  muted,
  linkPrimary,
  saveLabels,
}: CampaignListRowProps) {
  const pct = Math.min(100, Math.max(0, Math.round(campaign.fundingProgress ?? 0)));
  const days = daysRemaining(campaign.endDate);
  const companyName = campaign.company?.name ?? fu.company;

  return (
    <article
      className={`group/card flex flex-col gap-4 rounded-2xl border p-4 transition duration-200 sm:flex-row sm:gap-5 sm:p-5 ${
        isDark
          ? "border-white/[0.08] bg-zinc-900/30 hover:border-primary-500/25 hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-black/20"
          : "border-zinc-200/90 bg-white hover:border-primary-200 hover:shadow-md hover:shadow-primary-900/[0.06]"
      }`}
    >
      <CampaignThumbnail heroImageUrl={campaign.heroImageUrl} isDark={isDark} mutedClass={muted} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${muted}`}>
              {fu.posted} {formatDateShort(campaign.createdAt, locale)}
            </p>
            <Link
              href={`/projects/${campaign.id}`}
              className={`mt-1 block text-lg font-bold leading-snug transition group-hover/card:text-primary-600 dark:group-hover/card:text-primary-300 sm:text-xl ${isDark ? "text-white" : "text-zinc-900"}`}
            >
              {campaign.title}
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SaveCampaignButton
              campaignId={campaign.id}
              isSaved={campaign.isSavedByCurrentUser}
              labels={saveLabels}
              isDark={isDark}
            />
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${isDark ? "border-primary-500/35 bg-primary-500/15 text-primary-200" : "border-primary-200 bg-primary-50 text-primary-800"}`}
            >
              {campaign.status}
            </span>
          </div>
        </div>

        <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs ${muted}`}>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{companyName}</span>
          <span>
            {fu.raised}: {formatEtb(campaign.amountRaised ?? 0, locale)} / {formatEtb(campaign.fundingGoal ?? 0, locale)} ETB
          </span>
          <span>
            {fu.investors}: {campaign.totalInvestors ?? 0}
          </span>
          <span>
            {fu.ends}: {formatDateShort(campaign.endDate, locale)} ({days} {featured.daysLeft})
          </span>
        </div>

        <p className={`mt-2 line-clamp-2 text-sm leading-relaxed ${muted}`}>{campaign.shortDescription}</p>

        {campaign.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {campaign.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${isDark ? "border-primary-500/35 bg-primary-950/50 text-primary-200" : "border-primary-200/80 bg-primary-50/90 text-primary-900"}`}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4">
          <div className={`h-2 w-full overflow-hidden rounded-full ${isDark ? "bg-zinc-800" : "bg-zinc-200/90"}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-800 via-primary-600 to-primary-400 shadow-sm shadow-primary-900/20"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className={`mt-2 flex items-center justify-between text-xs ${muted}`}>
            <span className="font-bold text-primary-700 dark:text-primary-300">
              {pct}% {featured.funded}
            </span>
            <Link href={`/projects/${campaign.id}`} className={`inline-flex items-center gap-1 text-sm font-bold transition ${linkPrimary}`}>
              {copy.viewDetails}
              <span aria-hidden className="transition group-hover/card:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function CampaignThumbnail({
  heroImageUrl,
  isDark,
  mutedClass,
}: {
  heroImageUrl: string | null;
  isDark: boolean;
  mutedClass: string;
}) {
  return (
    <div
      className={`relative h-44 w-full shrink-0 overflow-hidden rounded-2xl ring-1 ring-inset ring-black/5 sm:h-32 sm:w-44 dark:ring-white/10 ${
        isDark ? "bg-zinc-800" : "bg-zinc-100"
      }`}
    >
      {heroImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote API host varies
        <img src={heroImageUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover/card:scale-[1.03]" />
      ) : (
        <div className={`flex h-full w-full items-center justify-center text-xs ${mutedClass}`}>—</div>
      )}
    </div>
  );
}
