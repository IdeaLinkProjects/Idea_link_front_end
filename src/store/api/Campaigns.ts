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
  fundingGoal: number;
  equityOffered: number;
  valuation: number;
  minInvestment: number;
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

export type CampaignTag = {
  id: number;
  name: string;
  campaignCount: number;
};

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
    getCampaignById: build.query<MyCampaign, number>({
      query: (id) => ({
        url: `campaigns/${id}`,
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
  }),
  overrideExisting: false,
});

export const {
  useGetMyCampaignsQuery,
  useGetCampaignByIdQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useUploadCampaignImageMutation,
  useUploadCampaignDocumentMutation,
  useDeleteCampaignDocumentMutation,
  useGetCampaignTagsQuery,
  useLazyGetCampaignDocumentByIdQuery,
  useLazySearchCampaignTagsQuery,
} = campaignsApi;
