import type { Locale } from "@/locales";
import type { UpcomingDividend } from "@/store";
import { formatCurrency, formatDate } from "../innovator/format";
import { StatusBadge, campaignStatusVariant } from "../innovator/dashboardUi";
import type { FintechTheme } from "../fintechTheme";

type InvestorUpcomingDividendsProps = {
  dividends: UpcomingDividend[];
  locale: Locale;
  isDark: boolean;
  theme: FintechTheme;
  labels: {
    title: string;
    empty: string;
    paymentDate: string;
  };
};

export function InvestorUpcomingDividends({
  dividends,
  locale,
  isDark,
  theme,
  labels,
}: InvestorUpcomingDividendsProps) {
  return (
    <div className={theme.card}>
      <div className={`border-b px-5 py-4 ${theme.divider}`}>
        <h2 className={`text-sm font-bold uppercase tracking-wider ${theme.value}`}>{labels.title}</h2>
      </div>
      {dividends.length === 0 ? (
        <p className={`px-5 py-10 text-center text-sm ${theme.muted}`}>{labels.empty}</p>
      ) : (
        <ul>
          {dividends.map((dividend) => (
            <li
              key={dividend.dividendId}
              className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 last:border-b-0 ${theme.divider} ${theme.rowHover}`}
            >
              <div className="min-w-0">
                <p className={`font-semibold ${theme.value}`}>{dividend.companyName}</p>
                <p className={`mt-0.5 text-xs ${theme.muted}`}>
                  {labels.paymentDate}: {formatDate(dividend.paymentDate, locale)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold tabular-nums ${theme.accent}`}>
                  {formatCurrency(dividend.amount, locale)}
                </p>
                <div className="mt-2">
                  <StatusBadge
                    label={dividend.status}
                    variant={campaignStatusVariant(dividend.status)}
                    isDark={isDark}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
