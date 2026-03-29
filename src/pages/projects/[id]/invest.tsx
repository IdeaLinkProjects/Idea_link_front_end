import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import am from "@/locales/am.json";
import en from "@/locales/en.json";

type Locale = "en" | "am";

const messages = { en, am } as const;

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

  const [locale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const s = window.localStorage.getItem("ideal-link-locale");
    return s === "am" || s === "en" ? s : "en";
  });
  const [theme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    const s = window.localStorage.getItem("ideal-link-theme");
    return s === "light" || s === "dark" ? s : "dark";
  });

  const [step, setStep] = useState<Step>(1);
  const [amount, setAmount] = useState(5000);
  const [chkDisclosed, setChkDisclosed] = useState(false);
  const [chkSimulated, setChkSimulated] = useState(false);
  const [chkReturns, setChkReturns] = useState(false);
  const [step1Attempted, setStep1Attempted] = useState(false);
  const [step2Attempted, setStep2Attempted] = useState(false);
  const [reference, setReference] = useState("");

  const t = messages[locale];
  const d = t.discovery;
  const p = t.projectDetail;
  const inv = t.investmentFlow;
  const isDark = theme === "dark";

  const idea = useMemo(() => d.ideas.find((i) => i.id === id), [d.ideas, id]);

  const bundle = useMemo((): ProjectBundle => {
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
  }, [d, idea, id, p]);

  const remaining = Math.max(0, bundle.goalEtb - bundle.raisedEtb);
  const pct = idea ? idea.fundedPercent : Math.min(100, Math.round((bundle.raisedEtb / bundle.goalEtb) * 100));

  useEffect(() => {
    setStep(1);
    setChkDisclosed(false);
    setChkSimulated(false);
    setChkReturns(false);
    setStep1Attempted(false);
    setStep2Attempted(false);
    setReference("");
    setAmount(5000);
  }, [id]);

  const equityPct = useMemo(() => {
    if (bundle.goalEtb <= 0) return 0;
    const raw = (amount / bundle.goalEtb) * bundle.equityOfferedPct;
    return Math.min(bundle.equityOfferedPct, Math.max(0, raw));
  }, [amount, bundle.goalEtb, bundle.equityOfferedPct]);

  const amountValid = amount >= bundle.minInvestmentEtb && amount <= remaining && remaining >= bundle.minInvestmentEtb;
  const step1ErrorMin = step1Attempted && amount < bundle.minInvestmentEtb;
  const step1ErrorMax = step1Attempted && amount > remaining;
  const step1ErrorCapacity = step1Attempted && remaining < bundle.minInvestmentEtb;

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
    if (!amountValid) return;
    setStep(2);
    setStep2Attempted(false);
  };

  const goConfirm = () => {
    setStep2Attempted(true);
    if (!chkDisclosed || !chkSimulated || !chkReturns) return;
    const ref = `IL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setReference(ref);
    setStep("success");
  };

  const addIncrement = (delta: number) => {
    setAmount((a) => Math.min(remaining, Math.max(bundle.minInvestmentEtb, a + delta)));
  };

  if (!router.isReady) {
    return null;
  }

  if (!idea) {
    return (
      <div
        className={`flex min-h-screen flex-col items-center justify-center gap-4 px-4 ${isDark ? "bg-zinc-950 text-zinc-200" : "bg-zinc-50 text-zinc-800"}`}
      >
        <p>{p.notFound}</p>
        <Link href="/discovery" className="text-emerald-500 underline">
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
        <header
          className={`border-b px-4 py-4 sm:px-6 ${isDark ? "border-white/10 bg-zinc-950/90" : "border-zinc-200 bg-white/90"}`}
        >
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <Link href={projectHref} className="text-sm font-semibold text-emerald-500 hover:underline">
              ← {inv.backToProject}
            </Link>
            <Link href="/" className="text-lg font-bold">
              <span className="text-emerald-500">{t.brand.ideal}</span>
              <span className="text-emerald-300">{t.brand.link}</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-10">
          {step === "success" ? (
            <div className="space-y-6">
              <div className={`rounded-2xl border p-6 text-center ${card}`}>
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">
                  ✓
                </div>
                <h1 className="text-2xl font-extrabold text-emerald-500">{inv.successTitle}</h1>
                <p className={`mt-2 text-sm ${muted}`}>{inv.successBody}</p>
              </div>

              <div className={`rounded-2xl border p-6 ${card}`}>
                <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-500">{inv.receiptTitle}</h2>
                <dl className={`mt-4 space-y-2 text-sm ${muted}`}>
                  <div className="flex justify-between gap-4">
                    <dt>{inv.receiptProject}</dt>
                    <dd className={`text-right font-medium ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{idea.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>{inv.receiptAmount}</dt>
                    <dd className={`font-mono font-semibold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>{formatEtb(amount, locale)} ETB</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>{inv.receiptEquity}</dt>
                    <dd className={`font-mono font-semibold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{equityPct.toFixed(2)}%</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>{inv.receiptReference}</dt>
                    <dd className="font-mono text-xs">{reference}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <p className={`mb-3 text-xs font-bold uppercase tracking-wide text-emerald-500`}>{inv.nextSteps}</p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/investor/portfolio"
                    className="rounded-xl bg-emerald-700 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-600"
                  >
                    {inv.viewPortfolio}
                  </Link>
                  <Link
                    href="/investor/messages"
                    className={`rounded-xl border py-3 text-center text-sm font-semibold ${isDark ? "border-white/20 hover:bg-white/10" : "border-zinc-300 hover:bg-zinc-100"}`}
                  >
                    {inv.messageInnovator}
                  </Link>
                  <Link
                    href="/discovery"
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
                <p className="font-semibold text-emerald-500">{inv.fundedStatus.replace("{pct}", String(pct))}</p>
                <p className={`tabular-nums ${muted}`}>
                  {inv.raisedOfGoal.replace("{raised}", formatEtb(bundle.raisedEtb, locale)).replace("{goal}", formatEtb(bundle.goalEtb, locale))}
                </p>
                <p className="font-medium text-emerald-400">
                  {inv.availableRemaining.replace("{amount}", formatEtb(remaining, locale))}
                </p>
              </div>

              {step1ErrorCapacity ? (
                <p className="mt-4 text-sm font-medium text-red-400">{inv.step1ErrorMax.replace("{max}", formatEtb(remaining, locale))}</p>
              ) : null}

              <div className="mt-6">
                <label htmlFor="inv-amount" className={`text-sm font-semibold ${muted}`}>
                  {inv.amountLabel}
                </label>
                <input
                  id="inv-amount"
                  type="number"
                  min={bundle.minInvestmentEtb}
                  max={remaining}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className={`mt-2 w-full rounded-xl border px-4 py-3 text-lg font-semibold tabular-nums outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isDark ? "border-white/15 bg-zinc-900 text-white" : "border-zinc-300 bg-white text-zinc-900"
                  }`}
                  aria-invalid={step1ErrorMin || step1ErrorMax}
                />
                <p className={`mt-2 text-sm font-medium ${muted}`}>
                  {inv.minInvestmentNote.replace("{amount}", formatEtb(bundle.minInvestmentEtb, locale))}
                </p>
                {step1ErrorMin ? (
                  <p className="mt-2 text-sm text-red-400">{inv.step1ErrorMin.replace("{min}", formatEtb(bundle.minInvestmentEtb, locale))}</p>
                ) : null}
                {step1ErrorMax && !step1ErrorCapacity ? (
                  <p className="mt-2 text-sm text-red-400">{inv.step1ErrorMax.replace("{max}", formatEtb(remaining, locale))}</p>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { v: 5000, label: inv.increment5000 },
                  { v: 10000, label: inv.increment10000 },
                  { v: 25000, label: inv.increment25000 },
                ].map((inc) => (
                  <button
                    key={inc.v}
                    type="button"
                    disabled={remaining < bundle.minInvestmentEtb}
                    onClick={() => addIncrement(inc.v)}
                    className="rounded-lg border border-emerald-600/50 px-3 py-2 text-sm font-semibold text-emerald-500 transition hover:bg-emerald-950/40 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {inc.label}
                  </button>
                ))}
              </div>

              <p className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-center text-sm font-semibold text-emerald-200">
                {inv.equityLive.replace("{invest}", formatEtb(amount, locale)).replace("{equity}", equityPct.toFixed(2))}
              </p>

              <button
                type="button"
                onClick={goReview}
                disabled={remaining < bundle.minInvestmentEtb}
                className="mt-8 w-full rounded-xl bg-emerald-700 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {inv.reviewButton}
              </button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className={`rounded-2xl border p-6 sm:p-8 ${card}`}>
              <h1 className="text-xl font-extrabold sm:text-2xl">{inv.step2Heading}</h1>

              <div className={`mt-6 rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50"}`}>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-500">{inv.summaryTitle}</p>
                <dl className={`mt-3 space-y-2 text-sm ${muted}`}>
                  <div className="flex justify-between">
                    <dt>{inv.summaryAmount}</dt>
                    <dd className={`font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{formatEtb(amount, locale)} ETB</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{inv.summaryEquity}</dt>
                    <dd className={`font-semibold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>{equityPct.toFixed(2)}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{inv.summaryDate}</dt>
                    <dd>{confirmDateLabel}</dd>
                  </div>
                </dl>
              </div>

              <section className="mt-8">
                <h2 className="text-sm font-bold text-emerald-500">{inv.risksSectionTitle}</h2>
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
                    className="mt-0.5 h-4 w-4 rounded border-zinc-500 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{inv.chkDisclosed}</span>
                </label>
                <label className="flex cursor-pointer gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={chkSimulated}
                    onChange={(e) => setChkSimulated(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-500 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{inv.chkSimulated}</span>
                </label>
                <label className="flex cursor-pointer gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={chkReturns}
                    onChange={(e) => setChkReturns(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-500 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{inv.chkReturns}</span>
                </label>
                {step2Attempted && (!chkDisclosed || !chkSimulated || !chkReturns) ? (
                  <p className="text-sm font-medium text-red-400">{inv.chkError}</p>
                ) : null}
              </div>

              <div className={`mt-8 rounded-xl border p-4 ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                <h3 className="text-sm font-bold text-emerald-500">{inv.termsSummaryTitle}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${muted}`}>{inv.termsSummaryBody}</p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={goConfirm}
                  className="flex-1 rounded-xl bg-emerald-700 py-3.5 text-sm font-bold text-white hover:bg-emerald-600"
                >
                  {inv.confirmInvestment}
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
            </div>
          ) : null}
        </main>
      </div>
    </>
  );
}
