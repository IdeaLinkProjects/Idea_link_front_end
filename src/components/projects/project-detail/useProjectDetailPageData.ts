import { useMemo } from "react";
import { myCampaignToDiscoveryIdea, type DiscoveryIdeaView } from "@/lib/campaign/fromMyCampaign";
import { resolveProjectBundle, resolveSimilarIdeas } from "@/lib/project-detail/resolveProjectBundle";
import type { Locale, messages } from "@/locales";
import { useGetCampaignByIdQuery } from "@/store";
import type { DiscoveryCategoryKey } from "./types";

type DiscoveryCopy = (typeof messages.en)["discovery"];
type ProjectDetailCopy = (typeof messages.en)["projectDetail"];

export function useProjectDetailPageData(routeId: string, locale: Locale, d: DiscoveryCopy, p: ProjectDetailCopy) {
  const campaignIdNum = useMemo(() => {
    const n = Number.parseInt(routeId, 10);
    return Number.isInteger(n) && n > 0 ? n : null;
  }, [routeId]);

  const { data: apiCampaign, isLoading: apiLoading, isError: apiError } = useGetCampaignByIdQuery(campaignIdNum!, {
    skip: campaignIdNum == null,
  });

  const idea = useMemo((): DiscoveryIdeaView | null => {
    if (campaignIdNum != null && apiCampaign) {
      return myCampaignToDiscoveryIdea(apiCampaign, locale);
    }
    return (d.ideas as unknown as DiscoveryIdeaView[]).find((i) => i.id === routeId) ?? null;
  }, [campaignIdNum, apiCampaign, d.ideas, routeId, locale]);

  const bundle = useMemo(
    () =>
      resolveProjectBundle({
        campaignIdNum,
        apiCampaign,
        locale,
        routeId,
        p,
        d,
        idea,
      }),
    [campaignIdNum, apiCampaign, locale, routeId, p, d, idea],
  );

  const catLabel = useMemo(() => {
    if (idea && idea.categoryKey in d.categories) {
      return d.categories[idea.categoryKey as DiscoveryCategoryKey];
    }
    return idea?.categoryKey ?? "";
  }, [d.categories, idea]);

  const pct = useMemo(() => {
    if (idea) return idea.fundedPercent;
    if (bundle.goalEtb > 0) return Math.min(100, Math.round((bundle.raisedEtb / bundle.goalEtb) * 100));
    return 0;
  }, [idea, bundle.goalEtb, bundle.raisedEtb]);

  const similarIdeas = useMemo(
    () =>
      resolveSimilarIdeas({
        campaignIdNum,
        apiCampaign,
        d,
        bundle,
        routeId,
      }),
    [campaignIdNum, apiCampaign, d, bundle, routeId],
  );

  return {
    campaignIdNum,
    apiCampaign,
    apiLoading,
    apiError,
    idea,
    bundle,
    catLabel,
    pct,
    similarIdeas,
  };
}
