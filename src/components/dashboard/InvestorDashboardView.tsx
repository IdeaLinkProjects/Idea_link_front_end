import Link from "next/link";
import { useMemo, useRef } from "react";
import { Compass, LayoutGrid } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { useFintechTheme } from "@/components/dashboard/fintechTheme";
import { InvestorKpiGrid } from "@/components/dashboard/investor/InvestorKpiGrid";
import { InvestorRecentInvestments } from "@/components/dashboard/investor/InvestorRecentInvestments";
import { InvestorUpcomingDividends } from "@/components/dashboard/investor/InvestorUpcomingDividends";
import { useInvestorDashboard } from "@/components/dashboard/investor/useInvestorDashboard";
import { InnovatorKycAlerts } from "@/components/dashboard/innovator/InnovatorKycAlerts";
import { InnovatorTransactionsHistory } from "@/components/dashboard/innovator/InnovatorTransactionsHistory";
import { InnovatorWalletActivityCard } from "@/components/dashboard/innovator/InnovatorWalletActivityCard";
import { DashboardErrorCard, KpiGridSkeleton } from "@/components/dashboard/innovator/dashboardUi";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import { useGetUserRolesStatusQuery } from "@/store";

function InvestorDashboardActions({
  browseLabel,
  portfolioLabel,
  theme,
}: {
  browseLabel: string;
  portfolioLabel: string;
  theme: ReturnType<typeof useFintechTheme>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/" className={theme.btnGhost}>
        <Compass className="h-4 w-4" aria-hidden />
        {browseLabel}
      </Link>
      <Link href="/dashboard/portfolio" className={theme.btnPrimary}>
        <LayoutGrid className="h-4 w-4" aria-hidden />
        {portfolioLabel}
      </Link>
    </div>
  );
}

export function InvestorDashboardView() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].investorDashboard;
  const shell = messages[locale].commonDashboard;
  const theme = useFintechTheme(isDark);
  const historyRef = useRef<HTMLDivElement>(null);
  const dashboard = useInvestorDashboard();
  const { data: userRolesStatus } = useGetUserRolesStatusQuery();

  const dateLabel = useMemo(() => {
    return new Intl.DateTimeFormat(locale === "am" ? "am-ET" : "en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }, [locale]);

  const welcomeName = userRolesStatus?.fullName?.trim() || shell.userFirstName;
  const pageTitle = t.welcome.replace("{name}", welcomeName);
  const pageSubtitle = t.today.replace("{date}", dateLabel);

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
        title={pageTitle}
        subtitle={pageSubtitle}
        actions={
          <InvestorDashboardActions
            browseLabel={t.browseProjects}
            portfolioLabel={t.navPortfolio}
            theme={theme}
          />
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
          <InvestorKpiGrid
            summary={dashboard.summary}
            locale={locale}
            theme={theme}
            labels={{
              walletBalance: t.statsWalletBalance,
              totalInvested: t.statsTotalInvested,
              activeInvestments: t.statsActiveInvestments,
              dividendsEarned: t.statsDividendsEarned,
              pendingRefunds: t.statsPendingRefunds,
              pendingWithdrawals: t.statsPendingWithdrawals,
            }}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <InvestorRecentInvestments
              investments={dashboard.recentInvestments}
              locale={locale}
              isDark={isDark}
              theme={theme}
              labels={{
                title: t.recentInvestmentsTitle,
                empty: t.emptyRecentInvestments,
                viewAction: t.viewCampaignAction,
              }}
            />
            <InvestorUpcomingDividends
              dividends={dashboard.upcomingDividends}
              locale={locale}
              isDark={isDark}
              theme={theme}
              labels={{
                title: t.upcomingDividendsTitle,
                empty: t.emptyUpcomingDividends,
                paymentDate: t.paymentDateLabel,
              }}
            />
          </div>

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
