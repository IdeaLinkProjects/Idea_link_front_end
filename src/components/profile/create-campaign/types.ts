export type StoryRisksItem = {
  key: string;
  value: string;
};

export type CreateCampaignForm = {
  title: string;
  shortDescription: string;
  heroImageUrl: string;
  equityOffered: string;
  valuation: string;
  totalShares: string;
  minimumSharesPerInvestor: string;
  durationDays: string;
  startDate: string;
  endDate: string;
  selectedTagIds: number[];
};

export type EditCampaignForm = CreateCampaignForm & {
  fundingGoal: string;
  minInvestment: string;
};

export const initialCreateCampaignForm: CreateCampaignForm = {
  title: "",
  shortDescription: "",
  heroImageUrl: "",
  equityOffered: "10",
  valuation: "10000",
  totalShares: "1",
  minimumSharesPerInvestor: "1",
  durationDays: "1",
  startDate: "",
  endDate: "",
  selectedTagIds: [],
};

export const emptyStoryRisksRow: StoryRisksItem = { key: "", value: "" };
