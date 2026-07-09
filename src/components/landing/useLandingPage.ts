import { useRouter } from "next/router";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import type { Locale } from "@/locales";
import { messages } from "@/locales";
import { useFilterCampaignsQuery, useGetPlatformStatsQuery } from "@/store";
import { LIVE_CAMPAIGNS_QUERY } from "./constants";
import { getLandingTheme } from "./landingTheme";
import type { LandingCampaign, LandingCopy, LandingTheme } from "./types";
import { campaignFromApi, campaignFromFallback, discoveryHref, landingStatsFromPlatform } from "./utils";

export type UseLandingPageResult = {
  locale: Locale;
  t: LandingCopy;
  theme: LandingTheme;
  query: string;
  setQuery: (value: string) => void;
  openFaq: number | null;
  setOpenFaq: (index: number | null) => void;
  liveLoading: boolean;
  campaigns: LandingCampaign[];
  stats: LandingCopy["stats"];
  goToDiscovery: (keyword?: string) => void;
  onSubmitSearch: (e: FormEvent) => void;
};

export function useLandingPage(): UseLandingPageResult {
  const { locale, isDark } = useAppPreferences();
  const router = useRouter();
  const t = messages[locale].landing;
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { data: liveData, isLoading: liveLoading } = useFilterCampaignsQuery(LIVE_CAMPAIGNS_QUERY);
  const { data: platformStats } = useGetPlatformStatsQuery();

  const goToDiscovery = useCallback(
    (keyword?: string) => {
      void router.push(discoveryHref(keyword));
    },
    [router],
  );

  const onSubmitSearch = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      goToDiscovery(query);
    },
    [goToDiscovery, query],
  );

  const campaigns = useMemo((): LandingCampaign[] => {
    const apiItems = liveData?.content ?? [];
    if (apiItems.length > 0) {
      return apiItems.map(campaignFromApi);
    }
    return t.featuredCampaigns.map(campaignFromFallback);
  }, [liveData?.content, t.featuredCampaigns]);

  const stats = useMemo(
    () => landingStatsFromPlatform(t.stats, platformStats, locale),
    [locale, platformStats, t.stats],
  );

  const theme = useMemo(() => getLandingTheme(isDark), [isDark]);

  return {
    locale,
    t,
    theme,
    query,
    setQuery,
    openFaq,
    setOpenFaq,
    liveLoading,
    campaigns,
    stats,
    goToDiscovery,
    onSubmitSearch,
  };
}
