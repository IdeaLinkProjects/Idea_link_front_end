import type { messages } from "@/locales";

export type LandingCopy = (typeof messages.en.landing);

export type LandingCampaign = {
  id: string;
  title: string;
  categoryLabel: string;
  location: string;
  fundedPercent: number;
  daysRemaining: number;
  raisedEtb: number;
  minInvestEtb: number;
  image: string;
  href: string;
};

export type LandingTheme = {
  isDark: boolean;
  section: string;
  muted: string;
  card: string;
  mintSection: string;
  sectionX: string;
};
