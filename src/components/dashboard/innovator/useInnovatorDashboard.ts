import { useMemo, useState } from "react";
import { KYC_STATUS, resolveAccountKycStatus } from "@/constants/kycStatus";
import {
  useGetInnovatorDashboardSummaryQuery,
  useGetInnovatorWalletTransactionsQuery,
  useGetMyCampaignsQuery,
  useGetUserRolesStatusQuery,
} from "@/store";
import {
  buildFundingChartSeries,
  filterTransactionsByRange,
  mergeUniqueTransactions,
  type ChartRange,
} from "./chartData";

export const TRANSACTIONS_PAGE_SIZE = 8;
export const CAMPAIGNS_TABLE_SIZE = 6;

export function useInnovatorDashboard() {
  const [transactionsPage, setTransactionsPage] = useState(0);
  const [chartRange, setChartRange] = useState<ChartRange>("6M");

  const { data: userRoles } = useGetUserRolesStatusQuery();
  const summaryQuery = useGetInnovatorDashboardSummaryQuery();
  const campaignsQuery = useGetMyCampaignsQuery({ page: 0, size: CAMPAIGNS_TABLE_SIZE });

  const transactionsRequest = useMemo(
    () => ({ page: transactionsPage, size: TRANSACTIONS_PAGE_SIZE }),
    [transactionsPage],
  );
  const transactionsQuery = useGetInnovatorWalletTransactionsQuery(transactionsRequest);

  const summary = summaryQuery.data;
  const recentActivity = summary?.recentWalletActivity ?? [];
  const campaigns = campaignsQuery.data?.content ?? [];
  const transactions = transactionsQuery.data?.content ?? [];
  const transactionsTotalPages = transactionsQuery.data?.totalPages ?? 0;

  const kycStatus = resolveAccountKycStatus(
    userRoles?.innovatorPrerequisites?.kycStatus,
    userRoles?.investorPrerequisites?.kycStatus,
  );

  const chartSeries = useMemo(() => {
    const merged = mergeUniqueTransactions(recentActivity, transactions);
    return buildFundingChartSeries(filterTransactionsByRange(merged, chartRange));
  }, [recentActivity, transactions, chartRange]);

  const showSummarySkeleton = summaryQuery.isLoading || (summaryQuery.isFetching && !summary);
  const showTransactionsSkeleton =
    transactionsQuery.isLoading || (transactionsQuery.isFetching && !transactionsQuery.data);

  const showKycPending = kycStatus === KYC_STATUS.PENDING;
  const showKycNotSubmitted = kycStatus === KYC_STATUS.NOT_SUBMITTED;

  return {
    chartRange,
    setChartRange,
    chartSeries,
    summary,
    breakdown: summary?.companyWalletBreakdown,
    recentActivity,
    campaigns,
    campaignsQuery,
    summaryQuery,
    transactions,
    transactionsQuery,
    transactionsPage,
    setTransactionsPage,
    transactionsTotalPages,
    showSummarySkeleton,
    showTransactionsSkeleton,
    showKycPending,
    showKycNotSubmitted,
  };
}
