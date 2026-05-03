import { baseApi } from "./baseApi";

export type RolePrerequisites = {
  emailVerified: boolean;
  fanVerified: boolean;
  innovatorProfileComplete: boolean | null;
  investorProfileComplete: boolean | null;
  /** e.g. NOT_SUBMITTED, PENDING, VERIFIED — see `KYC_STATUS` in `@/constants/kycStatus`. */
  kycStatus: string;
  phoneVerified: boolean;
};

export type UserRolesStatusResponse = {
  canBecomeInnovator: boolean;
  canBecomeInvestor: boolean;
  currentRoles: string[];
  email: string;
  fullName: string;
  innovatorPrerequisites: RolePrerequisites;
  investorPrerequisites: RolePrerequisites;
  userId: number;
};

export type InnovatorProfileResponse = {
  bio: string;
  companyRole: string;
  experienceYears: number | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  previousProjects?: InnovatorPreviousProject[];
};

export type InvestorProfileResponse = {
  riskTolerance: string;
  maxInvestmentLimit: number;
  preferredCategories: string[];
  accreditationVerified: boolean;
  investmentExperience: string;
};

export type CompleteInvestorProfileRequestBody = {
  riskTolerance: string;
  maxInvestmentLimit: number;
  investmentExperience: string;
  preferredCategories: string[];
};

export type InnovatorPreviousProject = {
  projectName: string;
  outcome: string;
  year: number;
  description: string;
};

export type CompleteInnovatorProfileRequestBody = {
  bio: string;
  experienceYears: number;
  linkedinUrl: string;
  websiteUrl: string;
  companyRole: string;
  previousProjects: InnovatorPreviousProject[];
};

export type CompleteProfileResponse = {
  message?: string;
};

export type DeleteCompanyResponse = {
  message?: string;
};

export type CompanyFounder = {
  id: number;
  fullName: string;
  email: string;
  profilePictureUrl: string | null;
};

export type CompanyCampaignStats = {
  totalCampaigns: number;
  successfulCampaigns: number;
  successRate: number;
  totalRaised: number;
};

export type CompanyTeamMember = {
  id: number;
  fullName: string;
  role: string;
  bio: string;
  linkedinUrl: string;
  email: string;
  orderIndex: number;
  profilePictureUrl: string | null;
  founder: boolean;
};

export type CompanyRecentCampaign = {
  id: number;
  title: string;
  status: string;
  fundingGoal: number;
  amountRaised: number;
  fundingProgress: number;
};

export type MyCompanyResponse = {
  id: number;
  name: string;
  industry: string;
  description: string;
  website: string;
  incorporationDate: string;
  registrationNumber: string;
  taxIdentificationNumber: string;
  businessLicenseNumber: string;
  isRegisteredCompany: boolean;
  logoUrl: string | null;
  coverImageUrl: string | null;
  foundedYear: number | null;
  headquarters: string;
  companiesize: string;
  stage: string;
  verified: boolean;
  founder: CompanyFounder | null;
  campaignStats: CompanyCampaignStats | null;
  teamMembers: CompanyTeamMember[];
  recentCampaigns: CompanyRecentCampaign[];
  createdAt: string;
  updatedAt: string;
};

export type UpdateCompanyRequestBody = {
  name: string;
  industry: string;
  description: string;
  website: string;
  incorporationDate: string;
  registrationNumber: string;
  taxIdentificationNumber: string;
  businessLicenseNumber: string;
  isRegisteredCompany: boolean;
  logoUrl: string;
  coverImageUrl: string;
  foundedYear: number | null;
  headquarters: string;
  companiesize: string;
  stage: string;
};

export type CreateCompanyRequestBody = {
  name: string;
  industry: string;
  description: string;
  website: string;
  incorporationDate: string;
  registrationNumber: string;
  taxIdentificationNumber: string;
  businessLicenseNumber: string;
  isRegisteredCompany: boolean;
  foundedYear: number;
  headquarters: string;
  companiesize: string;
  stage: string;
};

export type CreateCompanyTeamMemberRequestBody = {
  fullName: string;
  role: string;
  email?: string;
};

export type DeleteCompanyTeamMemberResponse = {
  message?: string;
};

export type UpdateCompanyTeamMemberRequestBody = {
  fullName: string;
  role: string;
  bio: string;
  linkedinUrl: string;
  email: string;
  orderIndex: number;
};

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUserRolesStatus: build.query<UserRolesStatusResponse, void>({
      query: () => ({
        url: "users/roles/status",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),
    getInnovatorProfile: build.query<InnovatorProfileResponse, void>({
      query: () => ({
        url: "profile/innovator",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),
    getInvestorProfile: build.query<InvestorProfileResponse, void>({
      query: () => ({
        url: "profile/investor",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),
    getMyCompany: build.query<MyCompanyResponse, void>({
      query: () => ({
        url: "companies/my-company",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),
    createCompany: build.mutation<MyCompanyResponse, CreateCompanyRequestBody>({
      query: (body) => ({
        url: "companies",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    getCompanyTeam: build.query<CompanyTeamMember[], { companyId: number }>({
      query: ({ companyId }) => ({
        url: `company/${companyId}/team`,
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),
    createCompanyTeamMember: build.mutation<
      CompanyTeamMember,
      { companyId: number; body: CreateCompanyTeamMemberRequestBody }
    >({
      query: ({ companyId, body }) => ({
        url: `company/${companyId}/team`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    deleteCompanyTeamMember: build.mutation<
      DeleteCompanyTeamMemberResponse,
      { companyId: number; memberId: number }
    >({
      query: ({ companyId, memberId }) => ({
        url: `company/${companyId}/team/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Profile"],
    }),
    updateCompanyTeamMember: build.mutation<
      CompanyTeamMember,
      { companyId: number; memberId: number; body: UpdateCompanyTeamMemberRequestBody }
    >({
      query: ({ companyId, memberId, body }) => ({
        url: `company/${companyId}/team/${memberId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    updateCompany: build.mutation<MyCompanyResponse, { companyId: number; body: UpdateCompanyRequestBody }>({
      query: ({ companyId, body }) => ({
        url: `companies/${companyId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    deleteCompany: build.mutation<DeleteCompanyResponse, { companyId: number }>({
      query: ({ companyId }) => ({
        url: `companies/${companyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Profile"],
    }),
    createInvestorProfile: build.mutation<CompleteProfileResponse, CompleteInvestorProfileRequestBody>({
      query: (body) => ({
        url: "profile/investor",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    completeInvestorProfile: build.mutation<CompleteProfileResponse, CompleteInvestorProfileRequestBody>({
      query: (body) => ({
        url: "profile/investor",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    createInnovatorProfile: build.mutation<CompleteProfileResponse, CompleteInnovatorProfileRequestBody>({
      query: (body) => ({
        url: "profile/innovator",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    completeInnovatorProfile: build.mutation<CompleteProfileResponse, CompleteInnovatorProfileRequestBody>({
      query: (body) => ({
        url: "profile/innovator",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserRolesStatusQuery,
  useGetInnovatorProfileQuery,
  useGetInvestorProfileQuery,
  useGetMyCompanyQuery,
  useCreateCompanyMutation,
  useGetCompanyTeamQuery,
  useCreateCompanyTeamMemberMutation,
  useDeleteCompanyTeamMemberMutation,
  useUpdateCompanyTeamMemberMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useCreateInvestorProfileMutation,
  useCompleteInvestorProfileMutation,
  useCreateInnovatorProfileMutation,
  useCompleteInnovatorProfileMutation,
} = profileApi;
