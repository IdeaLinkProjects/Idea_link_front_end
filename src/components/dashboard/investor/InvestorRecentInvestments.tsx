import Link from "next/link";
import type { Locale } from "@/locales";
import type { RecentInvestment } from "@/store";
import { formatCurrency, formatDate } from "../innovator/format";
import { StatusBadge, campaignStatusVariant } from "../innovator/dashboardUi";
import type { FintechTheme } from "../fintechTheme";

type InvestorRecentInvestmentsProps = {
  investments: RecentInvestment[];
  locale: Locale;
  isDark: boolean;
  theme: FintechTheme;
  labels: {
    title: string;
    empty: string;
    viewAction: string;
  };
};

export function InvestorRecentInvestments({
  investments,
  locale,
  isDark,
  theme,
  labels,
}: InvestorRecentInvestmentsProps) {
  return (
    <div className={theme.card}>
      <div className={`border-b px-5 py-4 ${theme.divider}`}>
        <h2 className={`text-sm font-bold uppercase tracking-wider ${theme.value}`}>{labels.title}</h2>
      </div>
      {investments.length === 0 ? (
        <p className={`px-5 py-10 text-center text-sm ${theme.muted}`}>{labels.empty}</p>
      ) : (
        <ul>
          {investments.map((investment) => (
            <li
              key={investment.investmentId}
              className={`border-b px-5 py-4 last:border-b-0 ${theme.divider} ${theme.rowHover}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-semibold ${theme.value}`}>{investment.campaignTitle}</p>
                  <p className={`mt-0.5 text-sm ${theme.muted}`}>{investment.companyName}</p>
                  <p className={`mt-1 text-xs tabular-nums ${theme.muted}`}>
                    {investment.ownershipPercentage.toFixed(2)}% · {formatDate(investment.investmentDate, locale)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold tabular-nums ${theme.accent}`}>
                    {formatCurrency(investment.amount, locale)}
                  </p>
                  <div className="mt-2">
                    <StatusBadge
                      label={investment.status}
                      variant={campaignStatusVariant(investment.status)}
                      isDark={isDark}
                    />
                  </div>
                </div>
              </div>
              <Link
                href={`/dashboard/campaigns/${investment.campaignId}`}
                className={`mt-3 inline-flex ${theme.link}`}
              >
                {labels.viewAction} →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
