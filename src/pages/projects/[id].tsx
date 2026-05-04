import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { myCampaignToDiscoveryIdea, myCampaignToPublicBundle, type DiscoveryIdeaView } from "@/lib/campaign/fromMyCampaign";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { type Locale, messages } from "@/locales";
import { useGetCampaignByIdQuery } from "@/store";

type CategoryKey = keyof typeof messages.en.discovery.categories;

type TabKey = "overview" | "risks" | "updates" | "documents" | "qa";

type ProjectBundle = {
  innovatorName: string;
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
  timeline: { milestone: string; date: string; done: boolean }[];
  funds: { label: string; percent: number }[];
  risksDisclosure: string;
  riskLevel: string;
  riskLevelExplanation: string;
  investorConsiderations: string;
  updates: { date: string; title: string; body: string }[];
  documents: { name: string; kind: string; sizeLabel: string }[];
  qa: { q: string; a?: string; author: string; date: string }[];
};

function parseGoalEtb(goalStr: string): number {
  const s = goalStr.replace(/,/g, "").toLowerCase();
  const num = parseFloat(s.replace(/[^\d.]/g, ""));
  if (Number.isNaN(num) || num <= 0) return 500_000;
  if (s.includes("m") || s.includes("ሚሊዮን")) return Math.round(num * 1_000_000);
  if (s.includes("k") || s.includes("ሺህ")) return Math.round(num * 1_000);
  if (num < 500) return Math.round(num * 1_000);
  return Math.round(num);
}

function formatEtb(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "am" ? "am-ET" : "en-ET", { maximumFractionDigits: 0 }).format(n);
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";

  const { locale, isDark } = useAppPreferences();

  const [tab, setTab] = useState<TabKey>("overview");
  const [calcAmount, setCalcAmount] = useState(5000);
  const [toast, setToast] = useState("");
  const [qaDraft, setQaDraft] = useState("");
  const [extraQuestions, setExtraQuestions] = useState<{ q: string; author: string; date: string }[]>([]);

  const t = messages[locale];
  const d = t.discovery;
  const p = t.projectDetail;

  const campaignIdNum = useMemo(() => {
    const n = Number.parseInt(id, 10);
    return Number.isInteger(n) && n > 0 ? n : null;
  }, [id]);

  const { data: apiCampaign, isLoading: apiLoading, isError: apiError } = useGetCampaignByIdQuery(campaignIdNum!, {
    skip: campaignIdNum == null,
  });

  const idea = useMemo((): DiscoveryIdeaView | null => {
    if (campaignIdNum != null && apiCampaign) {
      return myCampaignToDiscoveryIdea(apiCampaign, locale);
    }
    return (d.ideas as unknown as DiscoveryIdeaView[]).find((i) => i.id === id) ?? null;
  }, [campaignIdNum, apiCampaign, d.ideas, id, locale]);

  const bundle = useMemo((): ProjectBundle => {
    if (campaignIdNum != null && apiCampaign) {
      return myCampaignToPublicBundle(apiCampaign, locale, p);
    }
    const raw = p.projects[id as keyof typeof p.projects];
    if (raw && typeof raw === "object" && "goalEtb" in raw) {
      return raw as unknown as ProjectBundle;
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
        qa: [],
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
      qa: [],
    };
  }, [campaignIdNum, apiCampaign, locale, d, idea, id, p]);

  const catLabel =
    idea && idea.categoryKey in d.categories ? d.categories[idea.categoryKey as CategoryKey] : idea?.categoryKey ?? "";

  const pct = idea
    ? idea.fundedPercent
    : bundle.goalEtb > 0
      ? Math.min(100, Math.round((bundle.raisedEtb / bundle.goalEtb) * 100))
      : 0;

  useEffect(() => {
    if (bundle.minInvestmentEtb > 0) {
      setCalcAmount((prev) => (prev < bundle.minInvestmentEtb ? bundle.minInvestmentEtb : prev));
    }
  }, [bundle.minInvestmentEtb]);
  const equityPreview = useMemo(() => {
    if (bundle.goalEtb <= 0) return 0;
    const raw = (calcAmount / bundle.goalEtb) * bundle.equityOfferedPct;
    return Math.min(bundle.equityOfferedPct, Math.max(0, raw));
  }, [calcAmount, bundle.goalEtb, bundle.equityOfferedPct]);

  const similarIdeas = useMemo((): DiscoveryIdeaView[] => {
    if (campaignIdNum != null && apiCampaign) return [];
    const ideas = d.ideas as unknown as DiscoveryIdeaView[];
    const ids = bundle.similarIds.length ? bundle.similarIds : ideas.filter((x) => x.id !== id).slice(0, 3).map((x) => x.id);
    return ids.map((sid) => ideas.find((i) => i.id === sid)).filter(Boolean) as DiscoveryIdeaView[];
  }, [apiCampaign, bundle, campaignIdNum, d.ideas, id]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2600);
  }, []);

  const onDocPreview = useCallback(() => {
    showToast(p.docDemoNote);
  }, [p.docDemoNote, showToast]);

  const onSubmitQuestion = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();
      const q = qaDraft.trim();
      if (!q) return;
      const dateStr = new Intl.DateTimeFormat(locale === "am" ? "am-ET" : "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date());
      setExtraQuestions((prev) => [{ q, author: locale === "am" ? "እርስዎ" : "You", date: dateStr }, ...prev]);
      setQaDraft("");
      showToast(p.qaDemoNote);
    },
    [qaDraft, locale, p.qaDemoNote, showToast],
  );

  if (!router.isReady) {
    return null;
  }

  if (campaignIdNum != null && apiLoading && !apiCampaign) {
    return (
      <div className={`flex min-h-screen items-center justify-center px-4 ${isDark ? "bg-zinc-950 text-zinc-200" : "bg-zinc-50 text-zinc-800"}`}>
        <p className="text-sm font-medium">…</p>
      </div>
    );
  }

  if (campaignIdNum != null && !apiLoading && !apiCampaign && apiError) {
    return (
      <div
        className={`flex min-h-screen flex-col items-center justify-center gap-4 px-4 ${isDark ? "bg-zinc-950 text-zinc-200" : "bg-zinc-50 text-zinc-800"}`}
      >
        <p>{p.notFound}</p>
        <Link href="/" className="text-primary-500 underline">
          {p.backDiscovery}
        </Link>
      </div>
    );
  }

  if (!idea) {
    return (
      <div
        className={`flex min-h-screen flex-col items-center justify-center gap-4 px-4 ${isDark ? "bg-zinc-950 text-zinc-200" : "bg-zinc-50 text-zinc-800"}`}
      >
        <p>{p.notFound}</p>
        <Link href="/" className="text-primary-500 underline">
          {p.backDiscovery}
        </Link>
      </div>
    );
  }

  const card = isDark ? "border-white/15 bg-white/10" : "border-zinc-200 bg-white";
  const muted = isDark ? "text-zinc-400" : "text-zinc-600";
  const tabBtn = (k: TabKey) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      tab === k
        ? isDark
          ? "bg-primary-900/50 text-primary-200"
          : "bg-primary-100 text-primary-900"
        : isDark
          ? "text-zinc-400 hover:bg-white/10 hover:text-white"
          : "text-zinc-600 hover:bg-zinc-100"
    }`;

  return (
    <>
      <Head>
        <title>
          {idea.name} | {t.brand.ideal}
          {t.brand.link}
        </title>
        <meta name="description" content={idea.description} />
      </Head>
      <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
        <header
          className={`sticky top-0 z-50 border-b backdrop-blur-xl ${isDark ? "border-white/10 bg-zinc-950/90" : "border-zinc-200 bg-white/90"}`}
        >
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link href="/" className="text-sm font-semibold text-primary-500 hover:underline">
              ← {p.backDiscovery}
            </Link>
            <Link href="/" className="text-lg font-bold">
              <span className="text-primary-500">{t.brand.ideal}</span>
              <span className="text-primary-300">{t.brand.link}</span>
            </Link>
          </div>
        </header>

        <div
          className={`sticky top-14 z-40 border-b px-4 py-4 backdrop-blur-md sm:px-6 ${isDark ? "border-white/10 bg-zinc-950/90" : "border-zinc-200 bg-white/95"}`}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-bold text-primary-500">{p.fundedLine.replace("{pct}", String(pct))}</p>
                <p className={`text-sm font-semibold tabular-nums ${muted}`}>
                  {p.raisedGoalLine.replace("{raised}", formatEtb(bundle.raisedEtb, locale)).replace("{goal}", formatEtb(bundle.goalEtb, locale))}
                </p>
              </div>
              <div className={`mt-2 h-2.5 overflow-hidden rounded-full ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-950 to-primary-600"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className={`mt-2 text-xs ${muted}`}>{p.daysRemainingLine.replace("{n}", String(idea.daysRemaining))}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href={`/projects/${id}/invest`}
                className="rounded-xl bg-primary-950 px-6 py-3 text-center text-sm font-bold text-white shadow-lg shadow-primary-950/30 transition hover:bg-primary-900"
              >
                {p.investCta}
              </Link>
              <p className={`text-center text-xs font-medium sm:text-left ${muted}`}>
                {p.minInvestment.replace("{amount}", formatEtb(bundle.minInvestmentEtb, locale))}
              </p>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 xl:grid-cols-[1fr_340px]">
            <div className="min-w-0">
              <div
                className={`relative mb-6 aspect-[21/9] w-full overflow-hidden rounded-2xl border sm:aspect-[2/1] ${isDark ? "border-white/10" : "border-zinc-200"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- campaign hero URLs come from the API */}
                <img src={idea.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{idea.name}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium ${card}`}>
                  <span>{bundle.innovatorName}</span>
                  <span className="rounded-full bg-primary-950/20 px-2 py-0.5 text-xs font-bold text-primary-500">
                    {p.verifiedInnovator}
                  </span>
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${card}`}>
                  <span aria-hidden>{idea.categoryIcon}</span>
                  <span>
                    {p.categoryLabel}: {catLabel}
                  </span>
                </span>
                <span className={`rounded-full border px-3 py-1 ${card}`}>
                  {p.postedLabel}: {bundle.postedDate}
                </span>
              </div>

              <p className={`mt-6 text-lg leading-relaxed ${muted}`}>{idea.description}</p>

              <div
                className={`mt-8 flex flex-wrap gap-2 border-b pb-3 ${isDark ? "border-white/10" : "border-zinc-200"}`}
                role="tablist"
                aria-label="Project sections"
              >
                <button type="button" role="tab" aria-selected={tab === "overview"} className={tabBtn("overview")} onClick={() => setTab("overview")}>
                  {p.tabs.overview}
                </button>
                <button type="button" role="tab" aria-selected={tab === "risks"} className={tabBtn("risks")} onClick={() => setTab("risks")}>
                  {p.tabs.risks}
                </button>
                <button type="button" role="tab" aria-selected={tab === "updates"} className={tabBtn("updates")} onClick={() => setTab("updates")}>
                  {p.tabs.updates}
                </button>
                <button type="button" role="tab" aria-selected={tab === "documents"} className={tabBtn("documents")} onClick={() => setTab("documents")}>
                  {p.tabs.documents}
                </button>
                <button type="button" role="tab" aria-selected={tab === "qa"} className={tabBtn("qa")} onClick={() => setTab("qa")}>
                  {p.tabs.qa}
                </button>
              </div>

              <div className="mt-8 space-y-8">
                {tab === "overview" ? (
                  <>
                    <section className={`rounded-2xl border p-6 ${card}`}>
                      <h2 className="text-lg font-bold text-primary-500">{p.overview.problemTitle}</h2>
                      <p className={`mt-3 leading-relaxed ${muted}`}>{bundle.problem}</p>
                    </section>
                    <section className={`rounded-2xl border p-6 ${card}`}>
                      <h2 className="text-lg font-bold text-primary-500">{p.overview.solutionTitle}</h2>
                      <p className={`mt-3 leading-relaxed ${muted}`}>{bundle.solution}</p>
                    </section>
                    <section className={`rounded-2xl border p-6 ${card}`}>
                      <h2 className="text-lg font-bold text-primary-500">{p.overview.teamTitle}</h2>
                      <p className={`mt-3 leading-relaxed ${muted}`}>{bundle.team}</p>
                    </section>
                    <section className={`rounded-2xl border p-6 ${card}`}>
                      <h2 className="text-lg font-bold text-primary-500">{p.overview.timelineTitle}</h2>
                      <ol className="mt-4 space-y-3">
                        {bundle.timeline.map((row, i) => (
                          <li key={i} className="flex gap-3">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                row.done ? "bg-primary-950 text-white" : isDark ? "bg-zinc-700 text-zinc-300" : "bg-zinc-200 text-zinc-600"
                              }`}
                            >
                              {row.done ? "✓" : i + 1}
                            </span>
                            <div>
                              <p className="font-semibold">{row.milestone}</p>
                              <p className={`text-sm ${muted}`}>{row.date}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </section>
                    <section className={`rounded-2xl border p-6 ${card}`}>
                      <h2 className="text-lg font-bold text-primary-500">{p.overview.fundsTitle}</h2>
                      <ul className="mt-4 space-y-3">
                        {bundle.funds.map((f, i) => (
                          <li key={i}>
                            <div className="flex justify-between text-sm font-medium">
                              <span>{f.label}</span>
                              <span className="tabular-nums">{f.percent}%</span>
                            </div>
                            <div className={`mt-1 h-2 overflow-hidden rounded-full ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}>
                              <div className="h-full rounded-full bg-primary-950" style={{ width: `${f.percent}%` }} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </>
                ) : null}

                {tab === "risks" ? (
                  <div className="space-y-6">
                    <section className={`rounded-2xl border p-6 ${card}`}>
                      <h2 className="text-lg font-bold text-primary-500">{p.risks.disclosureTitle}</h2>
                      <p className={`mt-3 leading-relaxed ${muted}`}>{bundle.risksDisclosure}</p>
                    </section>
                    <section className={`rounded-2xl border p-6 ${card}`}>
                      <h2 className="text-lg font-bold text-primary-500">{p.risks.levelTitle}</h2>
                      <p className="mt-3 text-2xl font-extrabold text-primary-500">{bundle.riskLevel}</p>
                      <p className={`mt-2 leading-relaxed ${muted}`}>{bundle.riskLevelExplanation}</p>
                    </section>
                    <section className={`rounded-2xl border p-6 ${card}`}>
                      <h2 className="text-lg font-bold text-primary-500">{p.risks.considerationsTitle}</h2>
                      <p className={`mt-3 leading-relaxed ${muted}`}>{bundle.investorConsiderations}</p>
                    </section>
                  </div>
                ) : null}

                {tab === "updates" ? (
                  <ul className="space-y-4">
                    {bundle.updates.map((u, i) => (
                      <li key={i} className={`rounded-2xl border p-6 ${card}`}>
                        <p className="text-xs font-bold uppercase tracking-wide text-primary-500">{u.date}</p>
                        <h3 className="mt-2 text-lg font-bold">{u.title}</h3>
                        <p className={`mt-2 leading-relaxed ${muted}`}>{u.body}</p>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {tab === "documents" ? (
                  <ul className="space-y-3">
                    {bundle.documents.length === 0 ? (
                      <li className={`rounded-2xl border p-6 text-sm ${muted} ${card}`}>{p.docDemoNote}</li>
                    ) : (
                      bundle.documents.map((doc, i) => (
                        <li key={i} className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${card}`}>
                          <div>
                            <p className="font-semibold">{doc.name}</p>
                            <p className={`text-xs ${muted}`}>{doc.sizeLabel}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={onDocPreview}
                              className={`rounded-lg border px-3 py-2 text-sm font-semibold ${isDark ? "border-white/20 hover:bg-white/10" : "border-zinc-300 hover:bg-zinc-50"}`}
                            >
                              {p.preview}
                            </button>
                            <button
                              type="button"
                              onClick={onDocPreview}
                              className="rounded-lg bg-primary-950 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-900"
                            >
                              {p.download}
                            </button>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                ) : null}

                {tab === "qa" ? (
                  <div className="space-y-8">
                    <ul className="space-y-4">
                      {extraQuestions.map((row, i) => (
                        <li key={`extra-${i}`} className={`rounded-2xl border p-6 ${card}`}>
                          <p className="text-sm font-semibold">{row.q}</p>
                          <p className={`mt-2 text-sm italic ${muted}`}>{p.noAnswerYet}</p>
                          <p className={`mt-2 text-xs ${muted}`}>
                            {row.author} · {row.date}
                          </p>
                        </li>
                      ))}
                      {bundle.qa.map((row, i) => (
                        <li key={i} className={`rounded-2xl border p-6 ${card}`}>
                          <p className="font-semibold">{row.q}</p>
                          {row.a ? <p className={`mt-2 leading-relaxed ${muted}`}>{row.a}</p> : <p className={`mt-2 text-sm italic ${muted}`}>{p.noAnswerYet}</p>}
                          <p className={`mt-2 text-xs ${muted}`}>
                            {row.author} · {row.date}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <form onSubmit={onSubmitQuestion} className={`rounded-2xl border p-6 ${card}`}>
                      <h3 className="font-bold text-primary-500">{p.askQuestion}</h3>
                      <label htmlFor="qa-input" className="sr-only">
                        {p.yourQuestion}
                      </label>
                      <textarea
                        id="qa-input"
                        value={qaDraft}
                        onChange={(e) => setQaDraft(e.target.value)}
                        rows={4}
                        placeholder={p.questionPlaceholder}
                        className={`mt-3 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/40 ${
                          isDark ? "border-white/15 bg-zinc-900 text-zinc-100" : "border-zinc-300 bg-white text-zinc-900"
                        }`}
                      />
                      <button
                        type="submit"
                        className="mt-3 rounded-xl bg-primary-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-900"
                      >
                        {p.submitQuestion}
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>

            <aside className="mt-10 space-y-6 lg:mt-0">
              <div className={`rounded-2xl border p-5 ${card}`}>
                <h2 className="text-sm font-bold uppercase tracking-wide text-primary-500">{p.calculatorTitle}</h2>
                <label htmlFor="calc-amt" className={`mt-3 block text-xs font-medium ${muted}`}>
                  {p.calculatorAmountLabel}
                </label>
                <input
                  id="calc-amt"
                  type="number"
                  min={0}
                  step={500}
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value) || 0)}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm tabular-nums outline-none focus:ring-2 focus:ring-primary-500/40 ${
                    isDark ? "border-white/15 bg-zinc-900" : "border-zinc-300 bg-white"
                  }`}
                />
                <p className={`mt-1 text-xs ${muted}`}>{p.calculatorHint}</p>
                <p className="mt-4 text-sm font-medium">
                  {p.calculatorEquityLabel}: <span className="text-lg font-extrabold text-primary-500">{equityPreview.toFixed(2)}%</span>
                </p>
              </div>

              <div className={`rounded-2xl border p-5 ${card}`}>
                <h2 className="text-sm font-bold uppercase tracking-wide text-primary-500">{p.quickStatsTitle}</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className={muted}>{p.statInvestors}</span>
                    <span className="font-bold tabular-nums">{bundle.investorsCount}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className={muted}>{p.statUpdates}</span>
                    <span className="font-bold tabular-nums">{bundle.updatesCount}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className={muted}>{p.statDocuments}</span>
                    <span className="font-bold tabular-nums">{bundle.documentsCount}</span>
                  </li>
                </ul>
              </div>

              {similarIdeas.length > 0 ? (
                <div className={`rounded-2xl border p-5 ${card}`}>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-primary-500">{p.similarTitle}</h2>
                  <ul className="mt-4 space-y-4">
                    {similarIdeas.map((s) => (
                      <li key={s.id}>
                        <Link href={`/projects/${s.id}`} className="group block">
                          <p className="font-semibold group-hover:text-primary-500">{s.name}</p>
                          <p className={`text-xs ${muted}`}>
                            {s.fundedPercent}% · {s.categoryIcon}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </div>
        </main>

        {toast ? (
          <div
            className="fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-xl border border-primary-500/40 bg-primary-950 px-4 py-3 text-center text-sm font-medium text-primary-100 shadow-lg"
            role="status"
          >
            {toast}
          </div>
        ) : null}
      </div>
    </>
  );
}
