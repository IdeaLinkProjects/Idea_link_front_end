import { formatEtb } from "@/lib/format/formatEtb";
import type { Locale, messages } from "@/locales";
import type { MyCampaign } from "@/store";

export type DiscoveryIdeaView = {
  id: string;
  name: string;
  description: string;
  categoryKey: string;
  categoryIcon: string;
  fundedPercent: number;
  daysRemaining: number;
  goalEtb: string;
  image: string;
};

export type PublicProjectBundle = {
  innovatorName: string;
  companyProfile: {
    name: string;
    logoUrl: string | null;
    description: string;
    industry: string;
    website: string;
  } | null;
  postedDate: string;
  goalEtb: number;
  raisedEtb: number;
  equityOfferedPct: number;
  minInvestmentEtb: number;
  investorsCount: number;
  updatesCount: number;
  documentsCount: number;
  similarIds: string[];
  problem: string;
  solution: string;
  team: string;
  storySections: { title: string; description: string }[];
  timeline: { milestone: string; date: string; done: boolean }[];
  funds: { label: string; percent: number }[];
  riskSections: { title: string; description: string }[];
  risksDisclosure: string;
  riskLevel: string;
  riskLevelExplanation: string;
  investorConsiderations: string;
  updates: { date: string; title: string; body: string }[];
  documents: { name: string; kind: string; sizeLabel: string; url?: string }[];
};

function daysRemaining(iso: string): number {
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

function formatPosted(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale === "am" ? "am-ET" : "en-ET", { year: "numeric", month: "long", day: "numeric" });
}

function storyText(c: MyCampaign): string {
  const raw = c.storyJson;
  if (!raw) return "";
  if (typeof raw === "string") {
    try {
      const o = JSON.parse(raw) as Record<string, string>;
      return Object.values(o).join("\n\n");
    } catch {
      return raw;
    }
  }
  if (typeof raw === "object") return Object.values(raw as Record<string, string>).join("\n\n");
  return "";
}

function keyedSections(input: Record<string, string> | string | null | undefined): { title: string; description: string }[] {
  if (!input) return [];
  const toEntries = (obj: Record<string, string>) =>
    Object.entries(obj)
      .map(([title, description]) => ({ title: title.trim(), description: String(description ?? "").trim() }))
      .filter((row) => row.title && row.description);
  if (typeof input === "string") {
    try {
      return toEntries(JSON.parse(input) as Record<string, string>);
    } catch {
      return [];
    }
  }
  if (typeof input === "object") return toEntries(input as Record<string, string>);
  return [];
}

function risksText(c: MyCampaign): string {
  const raw = c.risksJson;
  if (!raw) return "";
  if (typeof raw === "string") {
    try {
      const o = JSON.parse(raw) as Record<string, string>;
      return Object.values(o).join("\n\n");
    } catch {
      return raw;
    }
  }
  if (typeof raw === "object") return Object.values(raw as Record<string, string>).join("\n\n");
  return "";
}

export function myCampaignToDiscoveryIdea(c: MyCampaign, locale: Locale): DiscoveryIdeaView {
  const tag = c.tags?.[0];
  return {
    id: String(c.id),
    name: c.title,
    description: c.shortDescription,
    categoryKey: tag ?? "general",
    categoryIcon: "📌",
    fundedPercent: Math.round(c.fundingProgress ?? 0),
    daysRemaining: daysRemaining(c.endDate),
    goalEtb: `${formatEtb(c.fundingGoal, locale)} ETB`,
    image:
      c.heroImageUrl?.trim() ||
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop",
  };
}

type ProjectDetailCopy = (typeof messages.en)["projectDetail"];

export function myCampaignToPublicBundle(c: MyCampaign, locale: Locale, p: ProjectDetailCopy): PublicProjectBundle {
  const story = storyText(c);
  const risks = risksText(c);
  const storySections = keyedSections(c.storyJson);
  const riskSections = keyedSections(c.risksJson);
  const companyBlock = c.company ? `${c.company.name}\n\n${c.company.description}` : p.fallback.team;

  return {
    innovatorName: c.company?.name ?? p.innovatorFallback,
    companyProfile: c.company
      ? {
          name: c.company.name ?? "",
          logoUrl: c.company.logoUrl ?? null,
          description: c.company.description ?? "",
          industry: c.company.industry ?? "",
          website: c.company.website ?? "",
        }
      : null,
    postedDate: formatPosted(c.createdAt, locale),
    goalEtb: c.fundingGoal,
    raisedEtb: c.amountRaised,
    equityOfferedPct: c.equityOffered,
    minInvestmentEtb: c.minInvestment,
    investorsCount: c.totalInvestors ?? 0,
    updatesCount: 0,
    documentsCount: c.documents?.length ?? 0,
    similarIds: [],
    problem: story || p.fallback.problem.replace("{name}", c.title),
    solution: p.fallback.solution.replace("{name}", c.title),
    team: companyBlock,
    storySections,
    timeline: [
      { milestone: "Start", date: formatPosted(c.startDate, locale), done: true },
      { milestone: "End", date: formatPosted(c.endDate, locale), done: new Date(c.endDate) < new Date() },
    ],
    funds: [
      { label: "Campaign", percent: 40 },
      { label: "Operations", percent: 35 },
      { label: "Growth", percent: 15 },
      { label: "Reserve", percent: 10 },
    ],
    risksDisclosure: risks || p.fallback.risksDisclosure,
    riskSections,
    riskLevel: p.fallback.risksLevel,
    riskLevelExplanation: p.fallback.risksLevelExpl,
    investorConsiderations: p.fallback.risksConsiderations,
    updates: [{ date: formatPosted(c.updatedAt, locale), title: p.fallback.updateTitle, body: p.fallback.updateBody }],
    documents: (c.documents ?? []).map((doc) => ({
      name: doc.documentName,
      kind: doc.documentType,
      sizeLabel: `${Math.round((doc.fileSize ?? 0) / 1024)} KB`,
      url: doc.documentUrl?.trim() ?? "",
    })),
  };
}
