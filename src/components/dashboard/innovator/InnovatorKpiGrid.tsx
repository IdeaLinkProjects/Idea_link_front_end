import type { Locale } from "@/locales";
import type { InnovatorDashboardSummary } from "@/store";
import { formatCompactCurrency, formatCurrency } from "./format";
import { KpiCard } from "./dashboardUi";
import type { FintechTheme } from "./theme";

type InnovatorKpiGridProps = {
  summary: InnovatorDashboardSummary;
  locale: Locale;
  theme: FintechTheme;
  labels: {
    walletBalance: string;
    raised: string;
    active: string;
    investors: string;
    dividendsPaid: string;
    pendingPayouts: string;
  };
};

export function InnovatorKpiGrid({ summary, locale, theme, labels }: InnovatorKpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard label={labels.walletBalance} value={formatCurrency(summary.walletBalance, locale)} highlighted theme={theme} />
      <KpiCard label={labels.raised} value={formatCompactCurrency(summary.totalRaised, locale)} theme={theme} />
      <KpiCard label={labels.active} value={String(summary.activeCampaigns)} theme={theme} />
      <KpiCard label={labels.investors} value={String(summary.investorsCount)} theme={theme} />
      <KpiCard label={labels.dividendsPaid} value={formatCompactCurrency(summary.dividendsPaid, locale)} theme={theme} />
      <KpiCard label={labels.pendingPayouts} value={formatCompactCurrency(summary.pendingPayouts, locale)} theme={theme} />
    </div>
  );
}
