import { baseApi } from "./baseApi";

export type RolePrerequisites = {
  emailVerified: boolean;
  fanVerified: boolean;
  innovatorProfileComplete: boolean | null;
  investorProfileComplete: boolean | null;
  kycVerified: boolean;
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
    completeInvestorProfile: build.mutation<CompleteProfileResponse, CompleteInvestorProfileRequestBody>({
      query: (body) => ({
        url: "profile/investor",
        method: "PUT",
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
  useCompleteInvestorProfileMutation,
  useCompleteInnovatorProfileMutation,
} = profileApi;
