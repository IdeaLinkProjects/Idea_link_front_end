import type { DiscoveryIdeaView, PublicProjectBundle } from "@/lib/campaign/fromMyCampaign";
import { myCampaignToPublicBundle } from "@/lib/campaign/fromMyCampaign";
import type { Locale, messages } from "@/locales";
import type { MyCampaign } from "@/store";
import { parseGoalEtb } from "./parseGoalEtb";

type ProjectDetailCopy = (typeof messages.en)["projectDetail"];
type DiscoveryCopy = (typeof messages.en)["discovery"];

export function resolveProjectBundle(input: {
  campaignIdNum: number | null;
  apiCampaign: MyCampaign | undefined;
  locale: Locale;
  routeId: string;
  p: ProjectDetailCopy;
  d: DiscoveryCopy;
  idea: DiscoveryIdeaView | null;
}): PublicProjectBundle {
  const { campaignIdNum, apiCampaign, locale, routeId, p, d, idea } = input;

  if (campaignIdNum != null && apiCampaign) {
    return myCampaignToPublicBundle(apiCampaign, locale, p);
  }

  const raw = p.projects[routeId as keyof typeof p.projects];
  if (raw && typeof raw === "object" && "goalEtb" in raw) {
    return raw as unknown as PublicProjectBundle;
  }

  if (!idea) {
    return {
      innovatorName: p.innovatorFallback,
      postedDate: p.postedFallback,
      goalEtb: 45000,
      raisedEtb: 0,
      equityOfferedPct: 10,
      minInvestmentEtb: 5000,
      investorsCount: 0,
      updatesCount: 0,
      documentsCount: 0,
      similarIds: [],
      problem: p.fallback.problem.replace("{name}", "—"),
      solution: p.fallback.solution.replace("{name}", "—"),
      team: p.fallback.team,
      timeline: [{ milestone: "—", date: "—", done: false }],
      funds: [
        { label: "—", percent: 25 },
        { label: "—", percent: 25 },
        { label: "—", percent: 25 },
        { label: "—", percent: 25 },
      ],
      risksDisclosure: p.fallback.risksDisclosure,
      riskLevel: p.fallback.risksLevel,
      riskLevelExplanation: p.fallback.risksLevelExpl,
      investorConsiderations: p.fallback.risksConsiderations,
      updates: [{ date: "—", title: p.fallback.updateTitle, body: p.fallback.updateBody }],
      documents: [],
    };
  }

  const goalNum = parseGoalEtb(idea.goalEtb);
  const raised = Math.round((goalNum * idea.fundedPercent) / 100);
  const mockIdeas = d.ideas as unknown as DiscoveryIdeaView[];
  const similar = mockIdeas.filter((x) => x.id !== idea.id).slice(0, 3).map((x) => x.id);

  return {
    innovatorName: p.innovatorFallback,
    postedDate: p.postedFallback,
    goalEtb: goalNum,
    raisedEtb: raised,
    equityOfferedPct: 10,
    minInvestmentEtb: 5000,
    investorsCount: Math.max(3, Math.round(idea.fundedPercent / 8)),
    updatesCount: 2,
    documentsCount: 1,
    similarIds: similar,
    problem: p.fallback.problem.replace("{name}", idea.name),
    solution: p.fallback.solution.replace("{name}", idea.name),
    team: p.fallback.team,
    timeline: [
      { milestone: "Planning", date: "Q1", done: true },
      { milestone: "Execution", date: "Q2–Q3", done: false },
      { milestone: "Scale", date: "Q4", done: false },
    ],
    funds: [
      { label: "Materials", percent: 35 },
      { label: "Operations", percent: 35 },
      { label: "Marketing", percent: 20 },
      { label: "Reserve", percent: 10 },
    ],
    risksDisclosure: p.fallback.risksDisclosure,
    riskLevel: p.fallback.risksLevel,
    riskLevelExplanation: p.fallback.risksLevelExpl,
    investorConsiderations: p.fallback.risksConsiderations,
    updates: [{ date: "—", title: p.fallback.updateTitle, body: p.fallback.updateBody }],
    documents: [],
  };
}

export function resolveSimilarIdeas(input: {
  campaignIdNum: number | null;
  apiCampaign: MyCampaign | undefined;
  d: DiscoveryCopy;
  bundle: PublicProjectBundle;
  routeId: string;
}): DiscoveryIdeaView[] {
  const { campaignIdNum, apiCampaign, d, bundle, routeId } = input;
  if (campaignIdNum != null && apiCampaign) return [];
  const ideas = d.ideas as unknown as DiscoveryIdeaView[];
  const ids = bundle.similarIds.length ? bundle.similarIds : ideas.filter((x) => x.id !== routeId).slice(0, 3).map((x) => x.id);
  return ids.map((sid) => ideas.find((i) => i.id === sid)).filter(Boolean) as DiscoveryIdeaView[];
}
