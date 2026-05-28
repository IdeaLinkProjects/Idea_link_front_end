import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { IdealLinkLogo } from "@/components/brand/IdealLinkLogo";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { myCampaignToDiscoveryIdea, myCampaignToPublicBundle, type DiscoveryIdeaView } from "@/lib/campaign/fromMyCampaign";
import { useEffect, useMemo, useState } from "react";
import { type Locale, messages } from "@/locales";
import { useGetCampaignByIdQuery, useInvestInCampaignMutation } from "@/store";
import { hasStoredAuthTokens } from "@/lib/auth/tokenStorage";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { PublicSiteHeader } from "@/components/layout/PublicSiteHeader";

type ProjectBundle = {
  goalEtb: number;
  raisedEtb: number;
  equityOfferedPct: number;
  minInvestmentEtb: number;
  risksDisclosure: string;
  riskLevel: string;
  riskLevelExplanation: string;
  investorConsiderations: string;
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

function riskBulletsFromText(text: string, max = 5): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

type Step = 1 | 2 | "success";

export default function ProjectInvestPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";

  const { locale, isDark } = useAppPreferences();

  const [step, setStep] = useState<Step>(1);
  const [numberOfShares, setNumberOfShares] = useState(100);
  const [chkDisclosed, setChkDisclosed] = useState(false);
  const [chkSimulated, setChkSimulated] = useState(false);
  const [chkReturns, setChkReturns] = useState(false);
  const [step1Attempted, setStep1Attempted] = useState(false);
  const [step2Attempted, setStep2Attempted] = useState(false);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState("");

  const t = messages[locale];
  const d = t.discovery;
  const p = t.projectDetail;
  const inv = t.investmentFlow;

  const campaignIdNum = useMemo(() => {
    const n = Number.parseInt(id, 10);
    return Number.isInteger(n) && n > 0 ? n : null;
  }, [id]);

  const { data: apiCampaign, isLoading: apiLoading, isError: apiError } = useGetCampaignByIdQuery(campaignIdNum!, {
    skip: campaignIdNum == null,
  });
  const [investInCampaign, { isLoading: isSubmittingInvestment }] = useInvestInCampaignMutation();

  const idea = useMemo((): DiscoveryIdeaView | null => {
    if (campaignIdNum != null && apiCampaign) {
      return myCampaignToDiscoveryIdea(apiCampaign, locale);
    }
    return (d.ideas as unknown as DiscoveryIdeaView[]).find((i) => i.id === id) ?? null;
  }, [campaignIdNum, apiCampaign, d.ideas, id, locale]);

  const bundle = useMemo((): ProjectBundle => {
    if (campaignIdNum != null && apiCampaign) {
      const full = myCampaignToPublicBundle(apiCampaign, locale, p);
      return {
        goalEtb: full.goalEtb,
        raisedEtb: full.raisedEtb,
        equityOfferedPct: full.equityOfferedPct,
        minInvestmentEtb: full.minInvestmentEtb,
        risksDisclosure: full.risksDisclosure,
        riskLevel: full.riskLevel,
        riskLevelExplanation: full.riskLevelExplanation,
        investorConsiderations: full.investorConsiderations,
      };
    }
    const raw = p.projects[id as keyof typeof p.projects];
    if (raw && typeof raw === "object" && "goalEtb" in raw) {
      const r = raw as unknown as ProjectBundle;
      return {
        goalEtb: r.goalEtb,
        raisedEtb: r.raisedEtb,
        equityOfferedPct: r.equityOfferedPct,
        minInvestmentEtb: r.minInvestmentEtb,
        risksDisclosure: r.risksDisclosure,
        riskLevel: r.riskLevel,
        riskLevelExplanation: r.riskLevelExplanation,
        investorConsiderations: r.investorConsiderations,
      };
    }
    if (!idea) {
      return {
        goalEtb: 45000,
        raisedEtb: 0,
        equityOfferedPct: 10,
        minInvestmentEtb: 5000,
        risksDisclosure: p.fallback.risksDisclosure,
        riskLevel: p.fallback.risksLevel,
        riskLevelExplanation: p.fallback.risksLevelExpl,
        investorConsiderations: p.fallback.risksConsiderations,
      };
    }
    const goalNum = parseGoalEtb(idea.goalEtb);
    const raised = Math.round((goalNum * idea.fundedPercent) / 100);
    return {
      goalEtb: goalNum,
      raisedEtb: raised,
      equityOfferedPct: 10,
      minInvestmentEtb: 5000,
      risksDisclosure: p.fallback.risksDisclosure,
      riskLevel: p.fallback.risksLevel,
      riskLevelExplanation: p.fallback.risksLevelExpl,
      investorConsiderations: p.fallback.risksConsiderations,
    };
  }, [campaignIdNum, apiCampaign, locale, d, idea, id, p]);

  const remaining = Math.max(0, bundle.goalEtb - bundle.raisedEtb);
  const pct = idea
    ? idea.fundedPercent
    : bundle.goalEtb > 0
      ? Math.min(100, Math.round((bundle.raisedEtb / bundle.goalEtb) * 100))
      : 0;

  useEffect(() => {
    if (!router.isReady) return;
    if (!hasStoredAuthTokens()) {
      void router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
    }
  }, [router]);

  useEffect(() => {
    setStep(1);
    setChkDisclosed(false);
    setChkSimulated(false);
    setChkReturns(false);
    setStep1Attempted(false);
    setStep2Attempted(false);
    setReference("");
    setNotes("");
    setSubmitError("");
    setNumberOfShares(100);
  }, [id]);
  const sharesValid = Number.isInteger(numberOfShares) && numberOfShares > 0;
  const step1ErrorShares = step1Attempted && !sharesValid;

  const riskBullets = useMemo(() => {
    const base = riskBulletsFromText(bundle.risksDisclosure, 4);
    const extra = [
      `${locale === "am" ? "ደረጃ" : "Risk level"}: ${bundle.riskLevel} — ${bundle.riskLevelExplanation}`,
      bundle.investorConsiderations,
    ];
    return [...base, ...extra].filter(Boolean).slice(0, 6);
  }, [bundle, locale]);

  const confirmDateLabel = useMemo(() => {
    return new Intl.DateTimeFormat(locale === "am" ? "am-ET" : "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, [locale]);

  const goReview = () => {
    setStep1Attempted(true);
    if (!sharesValid) return;
    setStep(2);
    setStep2Attempted(false);
  };

  const goConfirm = () => {
    setStep2Attempted(true);
    if (!chkDisclosed || !chkSimulated || !chkReturns) return;
    void submitInvestment();
  };

  const submitInvestment = async () => {
    if (campaignIdNum == null || !sharesValid) return;
    setSubmitError("");
    const sanitizedShares = Number.isFinite(numberOfShares) ? Math.max(1, Math.round(numberOfShares)) : 1;
    const payload = {
      numberOfShares: sanitizedShares,
      notes: notes.trim(),
    };
    try {
      const res = await investInCampaign({
        campaignId: campaignIdNum,
        payload,
      }).unwrap();
      setReference(
        res.transactionReference ??
          `IL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      );
      setStep("success");
    } catch (err) {
      setSubmitError(extractApiErrorMessage(err, "Unable to complete investment. Please try again."));
    }
  };

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
  const projectHref = `/projects/${id}`;

  return (
    <>
      <Head>
        <title>
          {inv.metaTitle} — {idea.name}
        </title>
      </Head>
      <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      <PublicSiteHeader backHref="/" backLabel={t.nav.home} />

        <main className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-10">
          {step === "success" ? (
            <div className="space-y-6">
              <div className={`rounded-2xl border p-6 text-center ${card}`}>
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-950 text-2xl text-white">
                  ✓
                </div>
                <h1 className="text-2xl font-extrabold text-primary-500">{inv.successTitle}</h1>
                <p className={`mt-2 text-sm ${muted}`}>{inv.successBody}</p>
              </div>

              <div className={`rounded-2xl border p-6 ${card}`}>
                <h2 className="text-sm font-bold uppercase tracking-wide text-primary-500">{inv.receiptTitle}</h2>
                <dl className={`mt-4 space-y-2 text-sm ${muted}`}>
                  <div className="flex justify-between gap-4">
                    <dt>{inv.receiptProject}</dt>
                    <dd className={`text-right font-medium ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{idea.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Number of shares</dt>
                    <dd className={`font-mono font-semibold ${isDark ? "text-primary-400" : "text-primary-700"}`}>{numberOfShares.toLocaleString()}</dd>
                  </div>
                  {notes.trim() ? (
                    <div className="flex justify-between gap-4">
                      <dt>Note</dt>
                      <dd className={`text-right ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{notes}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-4">
                    <dt>{inv.receiptReference}</dt>
                    <dd className="font-mono text-xs">{reference}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <p className={`mb-3 text-xs font-bold uppercase tracking-wide text-primary-500`}>{inv.nextSteps}</p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard/portfolio"
                    className="rounded-xl bg-primary-950 py-3 text-center text-sm font-semibold text-white hover:bg-primary-900"
                  >
                    {inv.viewPortfolio}
                  </Link>
                  <Link
                    href="/dashboard/messages"
                    className={`rounded-xl border py-3 text-center text-sm font-semibold ${isDark ? "border-white/20 hover:bg-white/10" : "border-zinc-300 hover:bg-zinc-100"}`}
                  >
                    {inv.messageInnovator}
                  </Link>
                  <Link
                    href="/"
                    className={`rounded-xl border py-3 text-center text-sm font-semibold ${isDark ? "border-white/20 hover:bg-white/10" : "border-zinc-300 hover:bg-zinc-100"}`}
                  >
                    {inv.browseMore}
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className={`rounded-2xl border p-6 sm:p-8 ${card}`}>
              <h1 className="text-xl font-extrabold leading-tight sm:text-2xl">{inv.step1Heading.replace("{project}", idea.name)}</h1>

              <div className={`mt-6 space-y-2 rounded-xl border p-4 text-sm ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50"}`}>
                <p className="font-semibold text-primary-500">{inv.fundedStatus.replace("{pct}", String(pct))}</p>
                <p className={`tabular-nums ${muted}`}>
                  {inv.raisedOfGoal.replace("{raised}", formatEtb(bundle.raisedEtb, locale)).replace("{goal}", formatEtb(bundle.goalEtb, locale))}
                </p>
                <p className="font-medium text-primary-400">
                  {inv.availableRemaining.replace("{amount}", formatEtb(remaining, locale))}
                </p>
              </div>

              <div className="mt-6">
                <label htmlFor="inv-amount" className={`text-sm font-semibold ${muted}`}>
                  Number of shares
                </label>
                <input
                  id="inv-amount"
                  type="number"
                  min={1}
                  step={1}
                  value={numberOfShares}
                  onChange={(e) => setNumberOfShares(Number(e.target.value) || 0)}
                  className={`mt-2 w-full rounded-xl border px-4 py-3 text-lg font-semibold tabular-nums outline-none focus:ring-2 focus:ring-primary-500/50 ${
                    isDark ? "border-white/15 bg-zinc-900 text-white" : "border-zinc-300 bg-white text-zinc-900"
                  }`}
                  aria-invalid={step1ErrorShares}
                />
                <p className={`mt-2 text-sm font-medium ${muted}`}>Enter whole shares only.</p>
                {step1ErrorShares ? (
                  <p className="mt-2 text-sm text-red-400">Please enter at least 1 share.</p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={goReview}
                disabled={remaining < bundle.minInvestmentEtb}
                className="mt-8 w-full rounded-xl bg-primary-950 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-primary-950/30 transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {inv.reviewButton}
              </button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className={`rounded-2xl border p-6 sm:p-8 ${card}`}>
              <h1 className="text-xl font-extrabold sm:text-2xl">{inv.step2Heading}</h1>

              <div className={`mt-6 rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50"}`}>
                <p className="text-xs font-bold uppercase tracking-wide text-primary-500">{inv.summaryTitle}</p>
                <dl className={`mt-3 space-y-2 text-sm ${muted}`}>
                  <div className="flex justify-between">
                    <dt>Number of shares</dt>
                    <dd className={`font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{numberOfShares.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{inv.summaryDate}</dt>
                    <dd>{confirmDateLabel}</dd>
                  </div>
                </dl>
              </div>

              <section className="mt-8">
                <h2 className="text-sm font-bold text-primary-500">{inv.risksSectionTitle}</h2>
                <ul className={`mt-3 list-disc space-y-2 pl-5 text-sm ${muted}`}>
                  {riskBullets.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </section>

              <div className="mt-8 space-y-4">
                <label className="flex cursor-pointer gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={chkDisclosed}
                    onChange={(e) => setChkDisclosed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-500 text-primary-600 focus:ring-primary-500"
                  />
                  <span>{inv.chkDisclosed}</span>
                </label>
                <label className="flex cursor-pointer gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={chkSimulated}
                    onChange={(e) => setChkSimulated(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-500 text-primary-600 focus:ring-primary-500"
                  />
                  <span>{inv.chkSimulated}</span>
                </label>
                <label className="flex cursor-pointer gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={chkReturns}
                    onChange={(e) => setChkReturns(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-500 text-primary-600 focus:ring-primary-500"
                  />
                  <span>{inv.chkReturns}</span>
                </label>
                {step2Attempted && (!chkDisclosed || !chkSimulated || !chkReturns) ? (
                  <p className="text-sm font-medium text-red-400">{inv.chkError}</p>
                ) : null}
              </div>

              <div className={`mt-8 rounded-xl border p-4 ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                <h3 className="text-sm font-bold text-primary-500">{inv.termsSummaryTitle}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${muted}`}>{inv.termsSummaryBody}</p>
              </div>

              <div className="mt-6">
                <label htmlFor="inv-notes" className={`text-sm font-semibold ${muted}`}>
                  Investment note (optional)
                </label>
                <textarea
                  id="inv-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a short note for this investment"
                  className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 ${
                    isDark ? "border-white/15 bg-zinc-900 text-white" : "border-zinc-300 bg-white text-zinc-900"
                  }`}
                />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={goConfirm}
                  disabled={isSubmittingInvestment}
                  className="flex-1 rounded-xl bg-primary-950 py-3.5 text-sm font-bold text-white hover:bg-primary-900"
                >
                  {isSubmittingInvestment ? "Processing..." : inv.confirmInvestment}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setStep2Attempted(false);
                  }}
                  className={`flex-1 rounded-xl border py-3.5 text-sm font-semibold ${isDark ? "border-white/20 hover:bg-white/10" : "border-zinc-300 hover:bg-zinc-100"}`}
                >
                  {inv.cancel}
                </button>
              </div>
              {submitError ? <p className="mt-3 text-sm font-medium text-red-400">{submitError}</p> : null}
            </div>
          ) : null}
        </main>
      </div>
    </>
  );
}
