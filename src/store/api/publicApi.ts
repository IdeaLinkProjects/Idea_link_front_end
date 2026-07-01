import { baseApi } from "./baseApi";

export type PlatformStatsResponse = {
  campaignsFunded: number;
  liveCampaigns: number;
  registeredMembers: number;
  totalBackers: number;
  totalPledgedEtb: number;
  updatedAt: string;
  verifiedInnovators: number;
};

export const publicApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPlatformStats: build.query<PlatformStatsResponse, void>({
      query: () => ({
        url: "public/platform-stats",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetPlatformStatsQuery } = publicApi;
