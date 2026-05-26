import { useMemo, useState } from "react";
import { KYC_STATUS, resolveAccountKycStatus } from "@/constants/kycStatus";
import {
  useGetInvestorDashboardSummaryQuery,
  useGetInvestorWalletTransactionsQuery,
  useGetUserRolesStatusQuery,
} from "@/store";

export const TRANSACTIONS_PAGE_SIZE = 8;

export function useInvestorDashboard() {
  const [transactionsPage, setTransactionsPage] = useState(0);

  const { data: userRoles } = useGetUserRolesStatusQuery();
  const summaryQuery = useGetInvestorDashboardSummaryQuery();

  const transactionsRequest = useMemo(
    () => ({ page: transactionsPage, size: TRANSACTIONS_PAGE_SIZE }),
    [transactionsPage],
  );
  const transactionsQuery = useGetInvestorWalletTransactionsQuery(transactionsRequest);

  const summary = summaryQuery.data;
  const recentInvestments = summary?.recentInvestments ?? [];
  const upcomingDividends = summary?.upcomingDividends ?? [];
  const recentActivity = summary?.recentWalletActivity ?? [];
  const transactions = transactionsQuery.data?.content ?? [];
  const transactionsTotalPages = transactionsQuery.data?.totalPages ?? 0;

  const kycStatus = resolveAccountKycStatus(
    userRoles?.innovatorPrerequisites?.kycStatus,
    userRoles?.investorPrerequisites?.kycStatus,
  );

  const showSummarySkeleton = summaryQuery.isLoading || (summaryQuery.isFetching && !summary);
  const showTransactionsSkeleton =
    transactionsQuery.isLoading || (transactionsQuery.isFetching && !transactionsQuery.data);

  const showKycPending = kycStatus === KYC_STATUS.PENDING;
  const showKycNotSubmitted = kycStatus === KYC_STATUS.NOT_SUBMITTED;

  return {
    summary,
    summaryQuery,
    recentInvestments,
    upcomingDividends,
    recentActivity,
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
