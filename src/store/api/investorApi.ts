import { baseApi } from "./baseApi";
import type { WalletTransaction } from "./innovatorApi";

export type { WalletTransaction };

export type RecentInvestment = {
  investmentId: number;
  campaignId: number;
  campaignTitle: string;
  companyName: string;
  amount: number;
  sharesPurchased: number;
  ownershipPercentage: number;
  status: string;
  investmentDate: string;
};

export type UpcomingDividend = {
  dividendId: number;
  companyName: string;
  amount: number;
  paymentDate: string;
  status: string;
};

export type InvestorDashboardSummary = {
  walletBalance: number;
  totalInvested: number;
  activeInvestments: number;
  totalDividendsEarned: number;
  pendingRefunds: number;
  pendingWithdrawals: number;
  recentInvestments: RecentInvestment[];
  upcomingDividends: UpcomingDividend[];
  recentWalletActivity: WalletTransaction[];
};

export type InvestorWalletTransactionsRequest = {
  page: number;
  size: number;
};

export type InvestorWalletTransactionsResponse = {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  size: number;
  content: WalletTransaction[];
  number: number;
  empty: boolean;
};

export const investorApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInvestorDashboardSummary: build.query<InvestorDashboardSummary, void>({
      query: () => ({
        url: "investor/dashboard/summary",
        method: "GET",
      }),
      providesTags: [{ type: "Profile", id: "investor-dashboard-summary" }],
    }),
    getInvestorWalletTransactions: build.query<InvestorWalletTransactionsResponse, InvestorWalletTransactionsRequest>({
      query: ({ page, size }) => ({
        url: "investor/wallet/transactions",
        method: "GET",
        params: { page, size },
      }),
      providesTags: [{ type: "Profile", id: "investor-wallet-transactions" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetInvestorDashboardSummaryQuery, useGetInvestorWalletTransactionsQuery } = investorApi;
