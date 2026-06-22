export type PaginatedResponse<T> = {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type PaginationRequest = {
  page: number;
  size: number;
};

export type MyCampaignsRequestBody = PaginationRequest;

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

export type MyCampaignsResponse = PaginatedResponse<MyCampaign>;

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

export type CampaignFilterPagination = PaginationRequest;

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

export type UserInvestmentsRequestBody = PaginationRequest;

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

export type UserInvestmentsResponse = PaginatedResponse<UserInvestment>;

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

export type CreateCampaignUpdateArg = {
  campaignId: number;
  body: CreateCampaignUpdateBody;
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

export type CampaignCommentsPageResponse = PaginatedResponse<CampaignComment>;

export type CampaignCommentsQueryArg = {
  campaignId: number;
  page?: number;
  size?: number;
};

export type CreateCampaignCommentBody = {
  comment: string;
  parentCommentId?: number;
};

export type CreateCampaignCommentArg = {
  campaignId: number;
  body: CreateCampaignCommentBody;
};

export type UpdateCampaignCommentBody = {
  comment: string;
  parentCommentId?: number;
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
