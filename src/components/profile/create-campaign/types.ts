export type StoryRisksItem = {
  key: string;
  value: string;
};

export type CreateCampaignForm = {
  title: string;
  shortDescription: string;
  heroImageUrl: string;
  fundingGoal: string;
  equityOffered: string;
  valuation: string;
  minInvestment: string;
  startDate: string;
  endDate: string;
  selectedTagIds: number[];
};

export const initialCreateCampaignForm: CreateCampaignForm = {
  title: "",
  shortDescription: "",
  heroImageUrl: "",
  fundingGoal: "100000",
  equityOffered: "0.1",
  valuation: "10000",
  minInvestment: "100",
  startDate: "",
  endDate: "",
  selectedTagIds: [],
};

export const emptyStoryRisksRow: StoryRisksItem = { key: "", value: "" };
