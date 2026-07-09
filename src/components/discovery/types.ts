import type { messages } from "@/locales";

export type DiscoveryView = "all" | "saved";

export type DiscoveryFilterUi = (typeof messages.en.discovery)["filterUi"];

export type DiscoveryCopy = (typeof messages.en.discovery);

export type SaveCampaignLabels = {
  save: string;
  saved: string;
  loginToSave: string;
};
