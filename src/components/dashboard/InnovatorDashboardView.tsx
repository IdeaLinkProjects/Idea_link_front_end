import { useRef } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import { InnovatorCampaignsTable } from "./innovator/InnovatorCampaignsTable";
import { InnovatorDashboardActions } from "./innovator/InnovatorDashboardActions";
import { InnovatorFundingOverview } from "./innovator/InnovatorFundingOverview";
import { InnovatorKpiGrid } from "./innovator/InnovatorKpiGrid";
import { InnovatorKycAlerts } from "./innovator/InnovatorKycAlerts";
import { InnovatorTransactionsHistory } from "./innovator/InnovatorTransactionsHistory";
import { InnovatorWalletActivityCard } from "./innovator/InnovatorWalletActivityCard";
import { DashboardErrorCard, KpiGridSkeleton } from "./innovator/dashboardUi";
import { useFintechTheme } from "./fintechTheme";
import { useInnovatorDashboard } from "./innovator/useInnovatorDashboard";

export { InnovatorDashboardActions } from "./innovator/InnovatorDashboardActions";

export function InnovatorDashboardView() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].innovatorDashboard;
  const theme = useFintechTheme(isDark);
  const historyRef = useRef<HTMLDivElement>(null);
  const dashboard = useInnovatorDashboard();

  const scrollToHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const statusLabels = { completed: t.statusCompleted, pending: t.statusPending };

  return (
    <section className={`space-y-5 ${theme.page}`}>
      <InnovatorKycAlerts
        showPending={dashboard.showKycPending}
        showNotSubmitted={dashboard.showKycNotSubmitted}
        pendingMessage={t.alertKycPending}
        notSubmittedMessage={t.alertKycNotSubmitted}
        actionLabel={t.alertKycAction}
        theme={theme}
      />

      <DashboardPageHeader
        title={t.dashboardTitle}
        subtitle={t.dashboardSubtitle}
        actions={
          <InnovatorDashboardActions createLabel={t.createProject} manageLabel={t.manageCampaignsCta} />
        }
      />

      {dashboard.summaryQuery.isError ? (
        <DashboardErrorCard
          title={t.errors.loadSummaryTitle}
          description={extractApiErrorMessage(
            dashboard.summaryQuery.error,
            t.errors.loadSummaryDescription,
          )}
          retryLabel={t.retry}
          onRetry={() => dashboard.summaryQuery.refetch()}
          theme={theme}
        />
      ) : null}

      {dashboard.showSummarySkeleton ? <KpiGridSkeleton theme={theme} /> : null}

      {dashboard.summary && !dashboard.showSummarySkeleton ? (
        <>
          <InnovatorKpiGrid
            summary={dashboard.summary}
            locale={locale}
            theme={theme}
            labels={{
              walletBalance: t.statsWalletBalance,
              raised: t.statsRaised,
              active: t.statsActive,
              investors: t.statsInvestors,
              dividendsPaid: t.statsDividendsPaid,
              pendingPayouts: t.statsPendingPayouts,
            }}
          />

          <InnovatorFundingOverview
            summary={dashboard.summary}
            breakdown={dashboard.breakdown}
            chartSeries={dashboard.chartSeries}
            chartRange={dashboard.chartRange}
            onChartRangeChange={dashboard.setChartRange}
            locale={locale}
            isDark={isDark}
            theme={theme}
            labels={{
              fundingChartTitle: t.fundingChartTitle,
              chart1M: t.chart1M,
              chart6M: t.chart6M,
              chart1Y: t.chart1Y,
              keyMetricsTitle: t.keyMetricsTitle,
              walletAvailable: t.walletAvailable,
              walletEscrow: t.walletEscrow,
              walletDividendsReserve: t.walletDividendsReserve,
              raised: t.statsRaised,
              pendingPayouts: t.statsPendingPayouts,
            }}
          />

          <InnovatorCampaignsTable
            campaigns={dashboard.campaigns}
            isLoading={dashboard.campaignsQuery.isLoading}
            locale={locale}
            isDark={isDark}
            theme={theme}
            labels={{
              title: t.activeCampaignsTableTitle,
              empty: t.emptyMyCampaignsTitle,
              campaign: t.tableCampaign,
              raised: t.tableRaised,
              goal: t.tableGoal,
              investors: t.tableInvestors,
              progress: t.tableProgress,
              status: t.tableStatus,
              actions: t.tableActions,
              viewAction: t.viewCampaignAction,
            }}
          />

          <InnovatorWalletActivityCard
            title={t.walletActivityTitle}
            transactions={dashboard.recentActivity}
            emptyMessage={t.emptyActivity}
            viewHistoryLabel={t.viewHistory}
            onViewHistory={scrollToHistory}
            locale={locale}
            theme={theme}
            statusLabels={statusLabels}
          />
        </>
      ) : null}

      <InnovatorTransactionsHistory
        sectionRef={historyRef}
        title={t.transactionsTitle}
        transactions={dashboard.transactions}
        isLoading={dashboard.showTransactionsSkeleton}
        isError={dashboard.transactionsQuery.isError}
        error={dashboard.transactionsQuery.error}
        onRetry={() => dashboard.transactionsQuery.refetch()}
        currentPage={dashboard.transactionsPage}
        totalPages={dashboard.transactionsTotalPages}
        onPageChange={dashboard.setTransactionsPage}
        locale={locale}
        isDark={isDark}
        theme={theme}
        labels={{
          empty: t.emptyTransactions,
          loadErrorTitle: t.errors.loadTransactionsTitle,
          loadErrorDescription: t.errors.loadTransactionsDescription,
          retry: t.retry,
          statusCompleted: t.statusCompleted,
          statusPending: t.statusPending,
          paginationPrevious: t.paginationPrevious,
          paginationNext: t.paginationNext,
        }}
      />
    </section>
  );
}
