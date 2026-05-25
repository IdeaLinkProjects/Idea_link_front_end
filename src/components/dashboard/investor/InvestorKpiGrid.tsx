import type { Locale } from "@/locales";
import type { InvestorDashboardSummary } from "@/store";
import { formatCompactCurrency, formatCurrency } from "../innovator/format";
import { KpiCard } from "../innovator/dashboardUi";
import type { FintechTheme } from "../fintechTheme";

type InvestorKpiGridProps = {
  summary: InvestorDashboardSummary;
  locale: Locale;
  theme: FintechTheme;
  labels: {
    walletBalance: string;
    totalInvested: string;
    activeInvestments: string;
    dividendsEarned: string;
    pendingRefunds: string;
    pendingWithdrawals: string;
  };
};

export function InvestorKpiGrid({ summary, locale, theme, labels }: InvestorKpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard label={labels.walletBalance} value={formatCurrency(summary.walletBalance, locale)} highlighted theme={theme} />
      <KpiCard label={labels.totalInvested} value={formatCompactCurrency(summary.totalInvested, locale)} theme={theme} />
      <KpiCard label={labels.activeInvestments} value={String(summary.activeInvestments)} theme={theme} />
      <KpiCard label={labels.dividendsEarned} value={formatCompactCurrency(summary.totalDividendsEarned, locale)} theme={theme} />
      <KpiCard label={labels.pendingRefunds} value={formatCompactCurrency(summary.pendingRefunds, locale)} theme={theme} />
      <KpiCard label={labels.pendingWithdrawals} value={formatCompactCurrency(summary.pendingWithdrawals, locale)} theme={theme} />
    </div>
  );
}
