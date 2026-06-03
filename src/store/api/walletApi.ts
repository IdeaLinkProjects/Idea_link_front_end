import { baseApi } from "./baseApi";

export type WalletBalanceResponse = {
  balance: number;
  currency: string;
};

export type CompanyBankAccountResponse = {
  id: number;
  companyId: number;
  accountHolderName: string;
  bankCode: string;
  maskedAccountNumber: string;
  defaultAccount: boolean;
  verified: boolean;
  verifiedAt: string | null;
};

export type UpsertCompanyBankAccountRequest = {
  accountHolderName: string;
  bankCode: string;
  accountNumber: string;
  defaultAccount: boolean;
};

export type WithdrawCompanyFundsRequest = {
  amount: number;
};

export type WithdrawCompanyFundsResponse = {
  message?: string;
  amount?: number;
  reference?: string;
};

export const walletApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWalletBalance: build.query<WalletBalanceResponse, number>({
      query: (companyId) => ({
        url: `companies/${companyId}/wallet/balance`,
        method: "GET",
      }),
      providesTags: (_result, _error, companyId) => [{ type: "Wallet", id: `BALANCE-${companyId}` }],
    }),
    getCompanyBankAccount: build.query<CompanyBankAccountResponse, number>({
      query: (companyId) => ({
        url: `companies/${companyId}/bank-account`,
        method: "GET",
      }),
      providesTags: (_result, _error, companyId) => [{ type: "Wallet", id: `BANK-${companyId}` }],
    }),
    upsertCompanyBankAccount: build.mutation<
      CompanyBankAccountResponse,
      { companyId: number; body: UpsertCompanyBankAccountRequest }
    >({
      query: ({ companyId, body }) => ({
        url: `companies/${companyId}/bank-account`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) => [
        { type: "Wallet", id: `BANK-${companyId}` },
        { type: "Wallet", id: `BALANCE-${companyId}` },
      ],
    }),
    withdrawCompanyFunds: build.mutation<
      WithdrawCompanyFundsResponse,
      { companyId: number; body: WithdrawCompanyFundsRequest }
    >({
      query: ({ companyId, body }) => ({
        url: `companies/${companyId}/wallet/withdraw`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) => [
        { type: "Wallet", id: `BALANCE-${companyId}` },
        { type: "Wallet", id: `BANK-${companyId}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWalletBalanceQuery,
  useGetCompanyBankAccountQuery,
  useUpsertCompanyBankAccountMutation,
  useWithdrawCompanyFundsMutation,
} = walletApi;
