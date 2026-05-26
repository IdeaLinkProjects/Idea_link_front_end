import Link from "next/link";
import { Filter } from "lucide-react";
import type { Locale } from "@/locales";
import type { MyCampaign } from "@/store";
import { campaignStatusVariant, StatusBadge } from "./dashboardUi";
import { formatCurrency } from "./format";
import type { FintechTheme } from "./theme";

type InnovatorCampaignsTableProps = {
  campaigns: MyCampaign[];
  isLoading: boolean;
  locale: Locale;
  isDark: boolean;
  theme: FintechTheme;
  labels: {
    title: string;
    empty: string;
    campaign: string;
    raised: string;
    goal: string;
    investors: string;
    progress: string;
    status: string;
    actions: string;
    viewAction: string;
  };
};

export function InnovatorCampaignsTable({
  campaigns,
  isLoading,
  locale,
  isDark,
  theme,
  labels,
}: InnovatorCampaignsTableProps) {
  return (
    <div className={theme.card}>
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${theme.divider}`}>
        <h2 className={`text-sm font-bold uppercase tracking-wider ${theme.value}`}>{labels.title}</h2>
        <span className={theme.muted} aria-hidden>
          <Filter className="h-4 w-4" />
        </span>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3 p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`h-10 rounded-lg ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`} />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <p className={`px-5 py-10 text-center text-sm ${theme.muted}`}>{labels.empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${theme.divider} ${theme.muted}`}>
                <th className="px-5 py-3">{labels.campaign}</th>
                <th className="px-5 py-3">{labels.raised}</th>
                <th className="px-5 py-3">{labels.goal}</th>
                <th className="px-5 py-3">{labels.investors}</th>
                <th className="px-5 py-3">{labels.progress}</th>
                <th className="px-5 py-3">{labels.status}</th>
                <th className="px-5 py-3">{labels.actions}</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const progress = Math.min(100, Math.round(campaign.fundingProgress ?? 0));
                return (
                  <tr key={campaign.id} className={`border-b last:border-b-0 ${theme.divider} ${theme.rowHover}`}>
                    <td className={`max-w-[12rem] truncate px-5 py-4 font-semibold ${theme.value}`}>{campaign.title}</td>
                    <td className={`px-5 py-4 tabular-nums ${theme.value}`}>{formatCurrency(campaign.amountRaised, locale)}</td>
                    <td className={`px-5 py-4 tabular-nums ${theme.muted}`}>{formatCurrency(campaign.fundingGoal, locale)}</td>
                    <td className={`px-5 py-4 tabular-nums ${theme.value}`}>{campaign.totalInvestors ?? 0}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-16 overflow-hidden rounded-full ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}>
                                <div className={`h-full ${theme.progressBar}`} style={{ width: `${progress}%` }} />
                        </div>
                        <span className={`text-xs font-semibold tabular-nums ${theme.accent}`}>{progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        label={campaign.status}
                        variant={campaignStatusVariant(campaign.status)}
                        isDark={isDark}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/campaigns/${campaign.id}`}
                        className={theme.link}
                      >
                        {labels.viewAction}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
