import { baseApi } from "./baseApi";
import { campaignCommentsTags, campaignProfileTags, campaignUpdatesTags } from "./campaigns/cacheTags";
import { normalizeCampaignUpdatesResponse } from "./campaigns/normalize";
import type {
  CampaignComment,
  CampaignCommentsPageResponse,
  CampaignCommentsQueryArg,
  CampaignDocument,
  CampaignFilterRequestBody,
  CampaignTag,
  CampaignUpdate,
  CreateCampaignCommentArg,
  CreateCampaignRequestBody,
  CreateCampaignUpdateArg,
  DeleteCampaignCommentArg,
  DeleteCampaignDocumentArg,
  DeleteCampaignUpdateArg,
  MyCampaign,
  MyCampaignsRequestBody,
  MyCampaignsResponse,
  SubmitCampaignArg,
  UpdateCampaignArg,
  UpdateCampaignCommentArg,
  UpdateCampaignUpdateArg,
  UploadCampaignDocumentArg,
  UploadCampaignImageResponse,
  UserInvestmentsRequestBody,
  UserInvestmentsResponse,
} from "./campaigns/types";

export type {
  CampaignComment,
  CampaignCommentUser,
  CampaignCommentsPageResponse,
  CampaignCommentsQueryArg,
  CampaignDocument,
  CampaignFilterFilters,
  CampaignFilterPagination,
  CampaignFilterRequestBody,
  CampaignTag,
  CampaignUpdate,
  CreateCampaignCommentArg,
  CreateCampaignCommentBody,
  CreateCampaignRequestBody,
  CreateCampaignUpdateArg,
  CreateCampaignUpdateBody,
  DeleteCampaignCommentArg,
  DeleteCampaignDocumentArg,
  DeleteCampaignUpdateArg,
  MyCampaign,
  MyCampaignCompany,
  MyCampaignsRequestBody,
  MyCampaignsResponse,
  PaginatedResponse,
  PaginationRequest,
  SubmitCampaignArg,
  UpdateCampaignArg,
  UpdateCampaignCommentArg,
  UpdateCampaignCommentBody,
  UpdateCampaignRequestBody,
  UploadCampaignDocumentArg,
  UploadCampaignImageResponse,
  UserInvestment,
  UserInvestmentCampaign,
  UserInvestmentCampaignCompany,
  UserInvestmentPayment,
  UserInvestmentsRequestBody,
  UserInvestmentsResponse,
} from "./campaigns/types";

export { CAMPAIGN_FILTER_STATUS_OPTIONS } from "./campaigns/types";

export const campaignsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyCampaigns: build.query<MyCampaignsResponse, MyCampaignsRequestBody>({
      query: ({ page, size }) => ({
        url: "campaigns/my-campaigns",
        method: "GET",
        params: { page, size },
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
      providesTags: (_result, _err, id) => campaignProfileTags(id),
    }),

    createCampaign: build.mutation<MyCampaign, CreateCampaignRequestBody>({
      query: (body) => ({
        url: "campaigns",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),

    updateCampaign: build.mutation<MyCampaign, UpdateCampaignArg>({
      query: ({ id, body }) => ({
        url: `campaigns/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => campaignProfileTags(id),
    }),

    deleteCampaign: build.mutation<unknown, number>({
      query: (id) => ({
        url: `campaigns/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => campaignProfileTags(id),
    }),

    submitCampaign: build.mutation<unknown, SubmitCampaignArg>({
      query: ({ campaignId }) => ({
        url: `campaigns/${campaignId}/submit`,
        method: "POST",
        params: { campaignId },
      }),
      invalidatesTags: (_r, _e, { campaignId }) => campaignProfileTags(campaignId),
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
      invalidatesTags: (_r, _e, { campaignId }) => campaignProfileTags(campaignId),
    }),

    deleteCampaignDocument: build.mutation<unknown, DeleteCampaignDocumentArg>({
      query: ({ campaignId, documentId }) => ({
        url: `campaigns/${campaignId}/documents/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { campaignId }) => campaignProfileTags(campaignId),
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
      providesTags: (_result, _err, campaignId) => campaignUpdatesTags(campaignId),
    }),

    createCampaignUpdate: build.mutation<CampaignUpdate, CreateCampaignUpdateArg>({
      query: ({ campaignId, body }) => ({
        url: `campaigns/${campaignId}/updates`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { campaignId }) => campaignUpdatesTags(campaignId),
    }),

    updateCampaignUpdate: build.mutation<CampaignUpdate, UpdateCampaignUpdateArg>({
      query: ({ campaignId, updateId, body }) => ({
        url: `campaigns/${campaignId}/updates/${updateId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { campaignId }) => campaignUpdatesTags(campaignId),
    }),

    deleteCampaignUpdate: build.mutation<unknown, DeleteCampaignUpdateArg>({
      query: ({ campaignId, updateId }) => ({
        url: `campaigns/${campaignId}/updates/${updateId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { campaignId }) => campaignUpdatesTags(campaignId),
    }),

    getCampaignComments: build.query<CampaignCommentsPageResponse, CampaignCommentsQueryArg>({
      query: ({ campaignId, page = 0, size = 20 }) => ({
        url: `campaigns/${campaignId}/comments`,
        method: "GET",
        params: { page, size },
      }),
      providesTags: (_result, _err, { campaignId }) => campaignCommentsTags(campaignId),
    }),

    createCampaignComment: build.mutation<CampaignComment, CreateCampaignCommentArg>({
      query: ({ campaignId, body }) => ({
        url: `campaigns/${campaignId}/comments`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { campaignId }) => campaignCommentsTags(campaignId),
    }),

    updateCampaignComment: build.mutation<CampaignComment, UpdateCampaignCommentArg>({
      query: ({ campaignId, commentId, body }) => ({
        url: `campaigns/${campaignId}/comments/${commentId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { campaignId }) => campaignCommentsTags(campaignId),
    }),

    deleteCampaignComment: build.mutation<unknown, DeleteCampaignCommentArg>({
      query: ({ campaignId, commentId }) => ({
        url: `campaigns/${campaignId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { campaignId }) => campaignCommentsTags(campaignId),
    }),
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
  useGetCampaignCommentsQuery,
  useCreateCampaignCommentMutation,
  useUpdateCampaignCommentMutation,
  useDeleteCampaignCommentMutation,
} = campaignsApi;
