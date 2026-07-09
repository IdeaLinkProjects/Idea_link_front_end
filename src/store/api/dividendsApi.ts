import { baseApi } from "./baseApi";

export type CreateDividendRequest = {
  totalAmount: number;
  notes: string;
};

export type DividendAllocation = {
  investorId?: number;
  investorName?: string;
  investorEmail?: string;
  investmentAmount?: number;
  equityPercentage?: number;
  ownershipPercentage?: number;
  amount?: number;
  dividendAmount?: number;
};

export type DividendPreviewResponse = {
  totalAmount: number;
  totalInvestors?: number;
  allocations: DividendAllocation[];
  notes?: string;
};

export type CampaignDividend = {
  id: number;
  campaignId?: number;
  totalAmount: number;
  status: string;
  notes: string | null;
  createdAt: string;
};

export type CampaignDividendArg = {
  campaignId: number;
  dividendId: number;
};

function dividendListTags(campaignId: number) {
  return [{ type: "Profile" as const, id: `campaign-dividends-${campaignId}` }];
}

function normalizeDividend(raw: Record<string, unknown>): CampaignDividend {
  const id = typeof raw.id === "number" ? raw.id : typeof raw.dividendId === "number" ? raw.dividendId : 0;
  return {
    id,
    campaignId: typeof raw.campaignId === "number" ? raw.campaignId : undefined,
    totalAmount: typeof raw.totalAmount === "number" ? raw.totalAmount : 0,
    status: typeof raw.status === "string" ? raw.status : "UNKNOWN",
    notes: typeof raw.notes === "string" ? raw.notes : raw.notes == null ? null : String(raw.notes),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
  };
}

function normalizeDividendsResponse(response: unknown): CampaignDividend[] {
  if (Array.isArray(response)) {
    return response.map((item) => normalizeDividend(item as Record<string, unknown>));
  }
  if (response && typeof response === "object" && Array.isArray((response as { content?: unknown[] }).content)) {
    return (response as { content: Record<string, unknown>[] }).content.map(normalizeDividend);
  }
  return [];
}

function normalizePreviewResponse(response: unknown): DividendPreviewResponse {
  if (!response || typeof response !== "object") {
    return { totalAmount: 0, allocations: [] };
  }
  const raw = response as Record<string, unknown>;
  const allocations = Array.isArray(raw.allocations)
    ? (raw.allocations as Record<string, unknown>[])
    : Array.isArray(raw.distributions)
      ? (raw.distributions as Record<string, unknown>[])
      : [];

  return {
    totalAmount: typeof raw.totalAmount === "number" ? raw.totalAmount : 0,
    totalInvestors: typeof raw.totalInvestors === "number" ? raw.totalInvestors : undefined,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    allocations: allocations.map((item) => ({
      investorId: typeof item.investorId === "number" ? item.investorId : undefined,
      investorName: typeof item.investorName === "string" ? item.investorName : undefined,
      investorEmail: typeof item.investorEmail === "string" ? item.investorEmail : undefined,
      investmentAmount: typeof item.investmentAmount === "number" ? item.investmentAmount : undefined,
      equityPercentage:
        typeof item.equityPercentage === "number"
          ? item.equityPercentage
          : typeof item.ownershipPercentage === "number"
            ? item.ownershipPercentage
            : undefined,
      amount: typeof item.amount === "number" ? item.amount : undefined,
      dividendAmount:
        typeof item.dividendAmount === "number"
          ? item.dividendAmount
          : typeof item.amount === "number"
            ? item.amount
            : undefined,
    })),
  };
}

export const dividendsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCampaignDividends: build.query<CampaignDividend[], number>({
      query: (campaignId) => ({
        url: `campaigns/${campaignId}/dividends`,
        method: "GET",
      }),
      transformResponse: normalizeDividendsResponse,
      providesTags: (_result, _err, campaignId) => dividendListTags(campaignId),
    }),

    previewCampaignDividend: build.mutation<DividendPreviewResponse, { campaignId: number; body: CreateDividendRequest }>({
      query: ({ campaignId, body }) => ({
        url: `campaigns/${campaignId}/dividends/preview`,
        method: "POST",
        body,
      }),
      transformResponse: normalizePreviewResponse,
    }),

    createCampaignDividend: build.mutation<CampaignDividend, { campaignId: number; body: CreateDividendRequest }>({
      query: ({ campaignId, body }) => ({
        url: `campaigns/${campaignId}/dividends`,
        method: "POST",
        body,
      }),
      transformResponse: (response) => normalizeDividend(response as Record<string, unknown>),
      invalidatesTags: (_r, _e, { campaignId }) => dividendListTags(campaignId),
    }),

    executeCampaignDividend: build.mutation<CampaignDividend, CampaignDividendArg>({
      query: ({ campaignId, dividendId }) => ({
        url: `campaigns/${campaignId}/dividends/${dividendId}/execute`,
        method: "POST",
      }),
      transformResponse: (response) => normalizeDividend(response as Record<string, unknown>),
      invalidatesTags: (_r, _e, { campaignId }) => dividendListTags(campaignId),
    }),

    cancelCampaignDividend: build.mutation<void, CampaignDividendArg>({
      query: ({ campaignId, dividendId }) => ({
        url: `campaigns/${campaignId}/dividends/${dividendId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { campaignId }) => dividendListTags(campaignId),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCampaignDividendsQuery,
  usePreviewCampaignDividendMutation,
  useCreateCampaignDividendMutation,
  useExecuteCampaignDividendMutation,
  useCancelCampaignDividendMutation,
} = dividendsApi;
