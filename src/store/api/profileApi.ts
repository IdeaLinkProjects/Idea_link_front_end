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
};

export type InvestorProfileResponse = {
  riskTolerance: string;
  maxInvestmentLimit: number;
  preferredCategories: string[];
  accreditationVerified: boolean;
  investmentExperience: string;
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
  }),
  overrideExisting: false,
});

export const { useGetUserRolesStatusQuery, useGetInnovatorProfileQuery, useGetInvestorProfileQuery } = profileApi;
