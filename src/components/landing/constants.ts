import type { CampaignFilterRequestBody } from "@/store";

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80&auto=format&fit=crop";

export const DEFAULT_CAMPAIGN_IMAGE =
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop";

export const LIVE_CAMPAIGNS_QUERY: CampaignFilterRequestBody = {
  pagination: { page: 0, size: 3 },
  filters: {
    keyword: "",
    statuses: [],
    tagIds: [],
    activeNow: true,
    funded: false,
  },
};

export const LANDING_SECTION_X = "px-8 sm:px-12 lg:px-16";
