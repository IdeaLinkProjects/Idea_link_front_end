import type { DiscoveryIdeaView, PublicProjectBundle } from "@/lib/campaign/fromMyCampaign";
import type { Locale, messages } from "@/locales";

export type InvestmentFlowCopy = (typeof messages.en)["investmentFlow"];

export type InvestViewProps = {
  isDark: boolean;
  locale: Locale;
  inv: InvestmentFlowCopy;
  idea: DiscoveryIdeaView;
  bundle: PublicProjectBundle;
  pct: number;
};
