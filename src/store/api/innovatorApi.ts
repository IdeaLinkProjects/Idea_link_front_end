import { baseApi } from "./baseApi";

export type WalletTransaction = {
  id: number;
  entryType: string;
  amount: number;
  signedAmount: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: number;
  transactionReference: string;
  description: string;
  occurredAt: string;
  displayLabel: string;
  displayCategory: string;
};

export type CompanyWalletBreakdown = {
  availableBalance: number;
  pendingEscrowRelease: number;
  declaredDividendsReserve: number;
};

export type InnovatorDashboardSummary = {
  totalRaised: number;
  activeCampaigns: number;
  investorsCount: number;
  walletBalance: number;
  dividendsPaid: number;
  pendingPayouts: number;
  companyWalletBreakdown: CompanyWalletBreakdown;
  recentWalletActivity: WalletTransaction[];
};

export type InnovatorWalletTransactionsRequest = {
  page: number;
  size: number;
};

export type InnovatorWalletTransactionsResponse = {
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

export const innovatorApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInnovatorDashboardSummary: build.query<InnovatorDashboardSummary, void>({
      query: () => ({
        url: "innovator/dashboard/summary",
        method: "GET",
      }),
      providesTags: [{ type: "Profile", id: "innovator-dashboard-summary" }],
    }),
    getInnovatorWalletTransactions: build.query<InnovatorWalletTransactionsResponse, InnovatorWalletTransactionsRequest>({
      query: ({ page, size }) => ({
        url: "innovator/wallet/transactions",
        method: "GET",
        params: { page, size },
      }),
      providesTags: [{ type: "Profile", id: "innovator-wallet-transactions" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetInnovatorDashboardSummaryQuery, useGetInnovatorWalletTransactionsQuery } = innovatorApi;
