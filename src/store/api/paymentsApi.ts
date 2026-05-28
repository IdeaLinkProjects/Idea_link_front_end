import { baseApi } from "./baseApi";

export type ChapaInitializeRequest = {
  amount: number;
};

export type ChapaInitializeResponse = {
  txRef?: string;
  checkoutUrl?: string;
  checkout_url?: string;
  paymentUrl?: string;
  payment_url?: string;
  message?: string;
};

export type ChapaVerifyResponse = {
  verified: boolean;
  status: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paidAt: string;
};

export type InvestInCampaignRequest = {
  campaignId: number;
  payload: {
    numberOfShares: number;
    notes: string;
  };
};

export type InvestInCampaignResponse = {
  investmentId?: number;
  campaignId?: number;
  amount?: number;
  status?: string;
  transactionReference?: string;
};

export type InvestmentCampaignSummary = {
  id: number;
  title: string;
  status: string;
  fundingGoal: number;
  amountRaised: number;
  fundingProgress: number;
};

export type UserInvestmentItem = {
  id: number;
  amount: number;
  equityPercentage: number;
  sharesPurchased: number;
  sharePriceAtPurchase: number;
  status: string;
  investmentDate: string;
  completedDate: string | null;
  campaign: InvestmentCampaignSummary;
  coolingOffExpiry: string | null;
  withdrawalEligible: boolean;
};

export type UserInvestmentsPage = {
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: UserInvestmentItem[];
  number: number;
  empty: boolean;
};

export type UserInvestmentsRequest = {
  page: number;
  size: number;
};

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    initializeChapaPayment: build.mutation<ChapaInitializeResponse, ChapaInitializeRequest>({
      query: (body) => ({
        url: "payments/chapa/initialize",
        method: "POST",
        body,
      }),
    }),
    verifyChapaPayment: build.query<ChapaVerifyResponse, string>({
      query: (txRef) => ({
        url: `payments/chapa/verify/${encodeURIComponent(txRef)}`,
        method: "GET",
      }),
      providesTags: [{ type: "Profile", id: "investor-dashboard-summary" }],
    }),
    investInCampaign: build.mutation<InvestInCampaignResponse, InvestInCampaignRequest>({
      query: ({ campaignId, payload }) => ({
        url: `investments/${campaignId}/invest`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        "Profile",
        { type: "Profile", id: "investor-dashboard-summary" },
        { type: "Profile", id: "investor-wallet-transactions" },
      ],
    }),
    getUserInvestmentsPage: build.query<UserInvestmentsPage, UserInvestmentsRequest>({
      query: ({ page, size }) => ({
        url: "investments/user",
        method: "GET",
        params: { page, size },
      }),
      providesTags: [{ type: "Profile", id: "investor-investments" }],
    }),
    getInvestmentById: build.query<UserInvestmentItem, number>({
      query: (investmentId) => ({
        url: `investments/${investmentId}`,
        method: "GET",
      }),
      providesTags: (_res, _err, investmentId) => [{ type: "Profile", id: `investment-${investmentId}` }],
    }),
    cancelPendingInvestment: build.mutation<unknown, number>({
      query: (investmentId) => ({
        url: `investments/${investmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Profile", { type: "Profile", id: "investor-investments" }],
    }),
    withdrawInvestment: build.mutation<unknown, number>({
      query: (investmentId) => ({
        url: `investments/${investmentId}/withdraw`,
        method: "POST",
      }),
      invalidatesTags: ["Profile", { type: "Profile", id: "investor-investments" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useInitializeChapaPaymentMutation,
  useVerifyChapaPaymentQuery,
  useLazyVerifyChapaPaymentQuery,
  useInvestInCampaignMutation,
  useGetUserInvestmentsPageQuery,
  useGetInvestmentByIdQuery,
  useLazyGetInvestmentByIdQuery,
  useCancelPendingInvestmentMutation,
  useWithdrawInvestmentMutation,
} = paymentsApi;
