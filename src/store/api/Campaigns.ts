import { baseApi } from "./baseApi";

export type MyCampaignsRequestBody = {
  page: number;
  size: number;
};

export type MyCampaignCompany = {
  id: number;
  name: string;
  industry: string;
  description: string;
  website: string;
  logoUrl: string | null;
  totalCampaigns: number;
};

export type CampaignDocument = {
  id: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
  fileSize: number;
  mimeType: string;
  verificationStatus: string;
};

export type MyCampaign = {
  id: number;
  title: string;
  shortDescription: string;
  heroImageUrl: string | null;
  storyJson?: Record<string, string> | string | null;
  risksJson?: Record<string, string> | string | null;
  fundingGoal: number;
  equityOffered: number;
  valuation: number;
  minInvestment: number;
  totalShares?: number;
  minimumSharesPerInvestor?: number;
  durationDays?: number;
  amountRaised: number;
  fundingProgress: number;
  startDate: string;
  endDate: string;
  status: string;
  company: MyCampaignCompany | null;
  tags: string[];
  documents: CampaignDocument[];
  totalInvestors: number;
  totalComments: number;
  isSavedByCurrentUser: boolean;
  isInvestedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MyCampaignsResponse = {
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: MyCampaign[];
  number: number;
  empty: boolean;
};

export type CreateCampaignRequestBody = {
  title: string;
  shortDescription: string;
  heroImageUrl: string;
  storyJson: Record<string, string>;
  fundingGoal?: number;
  equityOffered: number;
  valuation: number;
  minInvestment?: number;
  totalShares: number;
  minimumSharesPerInvestor: number;
  durationDays: number;
  risksJson: Record<string, string>;
  startDate: string;
  endDate: string;
  tagIds: number[];
};

export type UpdateCampaignRequestBody = CreateCampaignRequestBody;

export type UpdateCampaignArg = {
  id: number;
  body: UpdateCampaignRequestBody;
};

export type DeleteCampaignDocumentArg = {
  campaignId: number;
  documentId: number;
};

export type UploadCampaignImageResponse = {
  file: {
    size: number;
    name: string;
    url: string;
  };
  success: number;
};

export type UploadCampaignDocumentArg = {
  campaignId: number;
  /** multipart/form-data */
  formData: FormData;
};

export type SubmitCampaignArg = {
  campaignId: number;
};

export type CampaignTag = {
  id: number;
  name: string;
  campaignCount: number;
};

/** Values sent to POST /public/filter — must match backend campaign status enum. */
export const CAMPAIGN_FILTER_STATUS_OPTIONS = ["ACTIVE", "FUNDED", "FUNDS_RELEASED"] as const;

export type CampaignFilterPagination = {
  page: number;
  size: number;
};

/** Body for POST /campaigns/filter — optional date/range fields sent only when set. */
export type CampaignFilterFilters = {
  keyword: string;
  statuses: string[];
  tagIds: number[];
  activeNow: boolean;
  funded: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  minFundingGoal?: number;
  maxFundingGoal?: number;
  minInvestment?: number;
  maxInvestment?: number;
};

export type CampaignFilterRequestBody = {
  pagination: CampaignFilterPagination;
  filters: CampaignFilterFilters;
};

export type UserInvestmentsRequestBody = {
  page: number;
  size: number;
};

export type UserInvestmentCampaignCompany = {
  id: number;
  name: string;
};

export type UserInvestmentCampaign = {
  id: number;
  title: string;
  heroImageUrl: string | null;
  company: UserInvestmentCampaignCompany | null;
};

export type UserInvestmentPayment = {
  amount: number;
  paidAt: string;
  paymentMethod: string;
  paymentReference: string;
  paymentStatus: string;
};

export type UserInvestment = {
  id: number;
  amount: number;
  netAmount: number;
  platformFee: number;
  paymentProcessingFee: number;
  equityPercentage: number;
  status: string;
  escrowStatus: string;
  investmentDate: string;
  completedDate: string | null;
  coolingOffExpiry: string | null;
  campaign: UserInvestmentCampaign;
  payment: UserInvestmentPayment | null;
};

export type UserInvestmentsResponse = {
  content: UserInvestment[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type CampaignUpdate = {
  id: number;
  campaignId: number;
  campaignTitle: string;
  title: string;
  content: Record<string, string>;
  isPinned: boolean;
  postedAt: string;
};

export type CreateCampaignUpdateBody = {
  title: string;
  content: Record<string, string>;
  isPinned: boolean;
};

export type UpdateCampaignUpdateArg = {
  campaignId: number;
  updateId: number;
  body: CreateCampaignUpdateBody;
};

export type DeleteCampaignUpdateArg = {
  campaignId: number;
  updateId: number;
};

export type CampaignCommentUser = {
  id: number;
  fullName: string;
  profilePictureUrl: string | null;
  isInvestor: boolean;
  isInnovator: boolean;
};

export type CampaignComment = {
  id: number;
  comment: string;
  user: CampaignCommentUser;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  replies: CampaignComment[];
};

export type CampaignCommentsPageResponse = {
  content: CampaignComment[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type CampaignCommentsQueryArg = {
  campaignId: number;
  page?: number;
  size?: number;
};

export type CreateCampaignCommentBody = {
  comment: string;
  parentCommentId?: number;
};

export type UpdateCampaignCommentBody = {
  comment: string;
};

export type UpdateCampaignCommentArg = {
  campaignId: number;
  commentId: number;
  body: UpdateCampaignCommentBody;
};

export type DeleteCampaignCommentArg = {
  campaignId: number;
  commentId: number;
};

/** Spring Page / wrapped list responses → plain array for the UI. */
function normalizeListResponse<T>(raw: unknown, nestedKeys: string[]): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    for (const key of nestedKeys) {
      const nested = record[key];
      if (Array.isArray(nested)) return nested as T[];
    }
  }
  return [];
}

function normalizeCampaignUpdatesResponse(raw: unknown): CampaignUpdate[] {
  return normalizeListResponse<CampaignUpdate>(raw, ["content", "updates", "data", "items"]);
}

export const campaignsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyCampaigns: build.query<MyCampaignsResponse, MyCampaignsRequestBody>({
      query: ({ page, size }) => ({
        url: "campaigns/my-campaigns",
        method: "GET",
        params: {
          page,
          size,
        },
      }),
      providesTags: ["Profile"],
    }),
    filterCampaigns: build.query<MyCampaignsResponse, CampaignFilterRequestBody>({
      query: (body) => ({
        url: "public/campaign/filter",
        method: "POST",
        body,
      }),
    }),
    getUserInvestments: build.query<UserInvestmentsResponse, UserInvestmentsRequestBody>({
      query: ({ page, size }) => ({
        url: "investments/user",
        method: "GET",
        params: { page, size },
      }),
      providesTags: ["Profile"],
    }),
    getCampaignById: build.query<MyCampaign, number>({
      query: (id) => ({
        url: `public/campaign/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => [{ type: "Profile", id: `campaign-${id}` }, "Profile"],
    }),
    createCampaign: build.mutation<MyCampaign, CreateCampaignRequestBody>({
      query: (body) => ({
        url: "campaigns",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    uploadCampaignImage: build.mutation<UploadCampaignImageResponse, FormData>({
      query: (body) => ({
        url: "uploads/image",
        method: "POST",
        body,
      }),
    }),
    uploadCampaignDocument: build.mutation<unknown, UploadCampaignDocumentArg>({
      query: ({ campaignId, formData }) => ({
        url: `campaigns/${campaignId}/documents`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (_r, _e, { campaignId }) => [{ type: "Profile", id: `campaign-${campaignId}` }, "Profile"],
    }),
    submitCampaign: build.mutation<unknown, SubmitCampaignArg>({
      query: ({ campaignId }) => ({
        url: `campaigns/${campaignId}/submit`,
        method: "POST",
        params: { campaignId },
      }),
      invalidatesTags: (_r, _e, { campaignId }) => [{ type: "Profile", id: `campaign-${campaignId}` }, "Profile"],
    }),
    updateCampaign: build.mutation<MyCampaign, UpdateCampaignArg>({
      query: ({ id, body }) => ({
        url: `campaigns/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Profile", id: `campaign-${id}` }, "Profile"],
    }),
    deleteCampaign: build.mutation<unknown, number>({
      query: (id) => ({
        url: `campaigns/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [{ type: "Profile", id: `campaign-${id}` }, "Profile"],
    }),
    deleteCampaignDocument: build.mutation<unknown, DeleteCampaignDocumentArg>({
      query: ({ campaignId, documentId }) => ({
        url: `campaigns/${campaignId}/documents/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { campaignId }) => [{ type: "Profile", id: `campaign-${campaignId}` }, "Profile"],
    }),
    getCampaignDocumentById: build.query<CampaignDocument, DeleteCampaignDocumentArg>({
      query: ({ campaignId, documentId }) => ({
        url: `campaigns/${campaignId}/documents/${documentId}`,
        method: "GET",
      }),
    }),
    getCampaignTags: build.query<CampaignTag[], void>({
      query: () => ({
        url: "campaign-tags",
        method: "GET",
      }),
    }),
    searchCampaignTags: build.query<CampaignTag[], { query: string; limit?: number }>({
      query: ({ query, limit = 10 }) => ({
        url: "campaign-tags/search",
        method: "GET",
        params: { query, limit },
      }),
    }),
    getCampaignUpdates: build.query<CampaignUpdate[], number>({
      query: (campaignId) => ({
        url: `campaigns/${campaignId}/updates`,
        method: "GET",
      }),
      transformResponse: normalizeCampaignUpdatesResponse,
      providesTags: (_result, _err, campaignId) => [{ type: "Profile", id: `campaign-${campaignId}-updates` }],
    }),
    createCampaignUpdate: build.mutation<CampaignUpdate, { campaignId: number; body: CreateCampaignUpdateBody }>({
      query: ({ campaignId, body }) => ({
        url: `campaigns/${campaignId}/updates`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { campaignId }) => [{ type: "Profile", id: `campaign-${campaignId}-updates` }],
    }),
    updateCampaignUpdate: build.mutation<CampaignUpdate, UpdateCampaignUpdateArg>({
      query: ({ campaignId, updateId, body }) => ({
        url: `campaigns/${campaignId}/updates/${updateId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { campaignId }) => [{ type: "Profile", id: `campaign-${campaignId}-updates` }],
    }),
    deleteCampaignUpdate: build.mutation<unknown, DeleteCampaignUpdateArg>({
      query: ({ campaignId, updateId }) => ({
        url: `campaigns/${campaignId}/updates/${updateId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { campaignId }) => [{ type: "Profile", id: `campaign-${campaignId}-updates` }],
    })
  }),
  overrideExisting: true,
});

export const {
  useGetMyCampaignsQuery,
  useGetUserInvestmentsQuery,
  useFilterCampaignsQuery,
  useGetCampaignByIdQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useUploadCampaignImageMutation,
  useUploadCampaignDocumentMutation,
  useSubmitCampaignMutation,
  useDeleteCampaignDocumentMutation,
  useGetCampaignTagsQuery,
  useLazyGetCampaignDocumentByIdQuery,
  useLazySearchCampaignTagsQuery,
  useGetCampaignUpdatesQuery,
  useCreateCampaignUpdateMutation,
  useUpdateCampaignUpdateMutation,
  useDeleteCampaignUpdateMutation,
} = campaignsApi;
