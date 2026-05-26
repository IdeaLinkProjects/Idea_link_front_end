import type { Locale } from "@/locales";
import type { CompanyWalletBreakdown, InnovatorDashboardSummary } from "@/store";
import type { ChartRange } from "./chartData";
import { FundingAreaChart } from "./FundingAreaChart";
import { formatCurrency } from "./format";
import type { FintechTheme } from "./theme";

type InnovatorFundingOverviewProps = {
  summary: InnovatorDashboardSummary;
  breakdown: CompanyWalletBreakdown | undefined;
  chartSeries: { t: number; v: number }[];
  chartRange: ChartRange;
  onChartRangeChange: (range: ChartRange) => void;
  locale: Locale;
  isDark: boolean;
  theme: FintechTheme;
  labels: {
    fundingChartTitle: string;
    chart1M: string;
    chart6M: string;
    chart1Y: string;
    keyMetricsTitle: string;
    walletAvailable: string;
    walletEscrow: string;
    walletDividendsReserve: string;
    raised: string;
    pendingPayouts: string;
  };
};

export function InnovatorFundingOverview({
  summary,
  breakdown,
  chartSeries,
  chartRange,
  onChartRangeChange,
  locale,
  isDark,
  theme,
  labels,
}: InnovatorFundingOverviewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className={`lg:col-span-2 ${theme.card} p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={`text-sm font-bold uppercase tracking-wider ${theme.value}`}>{labels.fundingChartTitle}</h2>
          <div className={`flex rounded-lg p-0.5 ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}>
            {(["1M", "6M", "1Y"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => onChartRangeChange(range)}
                className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                  chartRange === range ? theme.toggleActive : theme.toggleIdle
                }`}
              >
                {range === "1M" ? labels.chart1M : range === "6M" ? labels.chart6M : labels.chart1Y}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <FundingAreaChart series={chartSeries} isDark={isDark} />
        </div>
      </div>

      <div className={`${theme.card} p-5`}>
        <h2 className={`text-sm font-bold uppercase tracking-wider ${theme.value}`}>{labels.keyMetricsTitle}</h2>
        <ul className="mt-5 space-y-4">
          {breakdown ? (
            <>
              <li className="flex items-center justify-between gap-3">
                <span className={theme.label}>{labels.walletAvailable}</span>
                <span className={`text-sm font-bold tabular-nums ${theme.accent}`}>
                  {formatCurrency(breakdown.availableBalance, locale)}
                </span>
              </li>
              <li className={`flex items-center justify-between gap-3 border-t pt-4 ${theme.divider}`}>
                <span className={theme.label}>{labels.walletEscrow}</span>
                <span className={`text-sm font-bold tabular-nums ${theme.value}`}>
                  {formatCurrency(breakdown.pendingEscrowRelease, locale)}
                </span>
              </li>
              <li className={`flex items-center justify-between gap-3 border-t pt-4 ${theme.divider}`}>
                <span className={theme.label}>{labels.walletDividendsReserve}</span>
                <span className={`text-sm font-bold tabular-nums ${theme.value}`}>
                  {formatCurrency(breakdown.declaredDividendsReserve, locale)}
                </span>
              </li>
            </>
          ) : null}
          <li className={`flex items-center justify-between gap-3 border-t pt-4 ${theme.divider}`}>
            <span className={theme.label}>{labels.raised}</span>
            <span className={`text-sm font-bold tabular-nums ${theme.value}`}>{formatCurrency(summary.totalRaised, locale)}</span>
          </li>
          <li className={`flex items-center justify-between gap-3 border-t pt-4 ${theme.divider}`}>
            <span className={theme.label}>{labels.pendingPayouts}</span>
            <span className={`text-sm font-bold tabular-nums ${theme.value}`}>{formatCurrency(summary.pendingPayouts, locale)}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
