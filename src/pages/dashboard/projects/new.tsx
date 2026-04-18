import Head from "next/head";
import Link from "next/link";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { messages } from "@/locales";

const MIN_GOAL_ETB = 25_000;
const MAX_SHORT = 200;
const MIN_DETAILED = 500;
const MIN_EQUITY = 1;
const MAX_EQUITY = 45;

type Step = 1 | 2 | 3;

type RiskLevel = "low" | "medium" | "high" | "";

function parsePositiveInt(raw: string): number | null {
  const n = Number.parseInt(raw.replace(/,/g, "").trim(), 10);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

export default function InnovatorNewProjectPage() {
  const { locale, isDark } = useAppPreferences();

  const t = messages[locale].innovatorProjectWizard;

  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");

  const [fundingGoal, setFundingGoal] = useState("");
  const [duration, setDuration] = useState<"" | "30" | "45" | "60">("");
  const [equity, setEquity] = useState(10);
  const [fundsMaterials, setFundsMaterials] = useState("");
  const [fundsDevelopment, setFundsDevelopment] = useState("");
  const [fundsMarketing, setFundsMarketing] = useState("");
  const [fundsOther, setFundsOther] = useState("");

  const [riskMarket, setRiskMarket] = useState(false);
  const [riskExecution, setRiskExecution] = useState(false);
  const [riskFinancial, setRiskFinancial] = useState(false);
  const [riskRegulatory, setRiskRegulatory] = useState(false);
  const [riskNotes, setRiskNotes] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";
  const labelClass = isDark ? "text-zinc-300" : "text-zinc-700";
  const inputClass = isDark
    ? "border-white/20 bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
    : "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/25";
  const errBorder = "border-red-500 ring-2 ring-red-500/20";

  const categoryLabel = useMemo(() => {
    const c = t.categories.find((x) => x.value === category);
    return c?.label ?? category;
  }, [t.categories, category]);

  const goalNum = useMemo(() => parsePositiveInt(fundingGoal), [fundingGoal]);
  const fundsParts = useMemo(() => {
    return {
      m: parsePositiveInt(fundsMaterials),
      d: parsePositiveInt(fundsDevelopment),
      mk: parsePositiveInt(fundsMarketing),
      o: parsePositiveInt(fundsOther),
    };
  }, [fundsMaterials, fundsDevelopment, fundsMarketing, fundsOther]);

  const fundsTotal = useMemo(() => {
    const { m, d, mk, o } = fundsParts;
    if (m === null || d === null || mk === null || o === null) return null;
    return m + d + mk + o;
  }, [fundsParts]);

  const durationLabel = useMemo(() => {
    if (duration === "30") return t.duration30;
    if (duration === "45") return t.duration45;
    if (duration === "60") return t.duration60;
    return "—";
  }, [duration, t.duration30, t.duration45, t.duration60]);

  const riskLevelLabel = useMemo(() => {
    if (riskLevel === "low") return t.riskLow;
    if (riskLevel === "medium") return t.riskMedium;
    if (riskLevel === "high") return t.riskHigh;
    return "—";
  }, [riskLevel, t.riskLow, t.riskMedium, t.riskHigh]);

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = t.errors.title;
    if (!category) e.category = t.errors.category;
    if (shortDescription.length > MAX_SHORT) e.shortDescription = t.errors.shortLength;
    if (detailedDescription.trim().length < MIN_DETAILED) e.detailedDescription = t.errors.detailedLength;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
    if (goalNum === null) e.fundingGoal = t.errors.goalNumber;
    else if (goalNum < MIN_GOAL_ETB) e.fundingGoal = t.errors.goalMin;
    if (!duration) e.duration = t.errors.duration;
    if (equity < MIN_EQUITY || equity > MAX_EQUITY) e.equity = t.errors.equity;
    const { m, d, mk, o } = fundsParts;
    if (m === null || d === null || mk === null || o === null) {
      e.funds = t.errors.fundsNumber;
    } else if (goalNum !== null && m + d + mk + o !== goalNum) {
      e.funds = t.errors.fundsSum;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = (): boolean => {
    const e: Record<string, string> = {};
    if (!riskMarket || !riskExecution || !riskFinancial || !riskRegulatory) e.risks = t.errors.risksRequired;
    if (!riskLevel) e.riskLevel = t.errors.riskLevel;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (step === 1 && validateStep1()) {
      setErrors({});
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setErrors({});
      setStep(3);
    }
  };

  const goBack = () => {
    setErrors({});
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleSubmit = () => {
    if (!validateStep3()) return;
    setSubmitted(true);
  };

  const stepsMeta: { n: Step }[] = [{ n: 1 }, { n: 2 }, { n: 3 }];

  if (submitted) {
    return (
      <>
        <Head>
          <title>{t.metaTitle}</title>
        </Head>
        <DashboardLayout>
          <div className="mx-auto max-w-lg space-y-6 text-center">
            <div className={`rounded-2xl border p-8 ${cardClass}`}>
              <p className={`text-lg font-semibold ${isDark ? "text-primary-300" : "text-primary-800"}`}>{t.successTitle}</p>
              <p className={`mt-2 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.successBody}</p>
              <Link
                href="/dashboard/projects"
                className="mt-6 inline-flex rounded-xl bg-primary-950 px-6 py-3 font-semibold text-white shadow-lg hover:bg-primary-900"
              >
                {t.viewProjects}
              </Link>
            </div>
          </div>
        </DashboardLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardLayout>
        <div className="mx-auto max-w-3xl space-y-8">
          <Link href="/dashboard/projects" className="inline-flex text-sm font-semibold text-primary-500 hover:text-primary-400">
            ← {t.backToProjects}
          </Link>

          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>{t.heading}</h1>
            <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              {t.progressIntro
                .replace("{step}", String(step))
                .replace("{label}", step === 1 ? t.stepBasics : step === 2 ? t.stepFunding : t.stepRisks)}
            </p>
          </div>

          <nav aria-label="Progress">
            <p className={`mb-3 text-center text-sm font-medium sm:text-left ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              {t.progressIntro
                .replace("{step}", String(step))
                .replace("{label}", step === 1 ? t.stepBasics : step === 2 ? t.stepFunding : t.stepRisks)}
            </p>
            <ol className="grid gap-3 sm:grid-cols-3">
              {stepsMeta.map((s) => {
                const done = step > s.n;
                const active = step === s.n;
                const label = s.n === 1 ? t.stepBasics : s.n === 2 ? t.stepFunding : t.stepRisks;
                return (
                  <li
                    key={s.n}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                      active
                        ? isDark
                          ? "border-primary-500/50 bg-primary-950/40"
                          : "border-primary-300 bg-primary-50"
                        : done
                          ? isDark
                            ? "border-primary-950/40 bg-primary-950/20"
                            : "border-primary-200 bg-white"
                          : isDark
                            ? "border-white/10 bg-zinc-900/40"
                            : "border-zinc-200 bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        done
                          ? "bg-primary-950 text-white"
                          : active
                            ? "bg-primary-950 text-white"
                            : isDark
                              ? "bg-zinc-800 text-zinc-500"
                              : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {done ? "✓" : s.n}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                        {t.stepN.replace("{n}", String(s.n))}
                      </p>
                      <p className={`truncate text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{label}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className={`rounded-2xl border p-6 sm:p-8 ${cardClass}`}>
            {step === 1 ? (
              <div className="space-y-5">
                <div>
                  <label htmlFor="wiz-title" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                    {t.titleLabel}
                  </label>
                  <input
                    id="wiz-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t.titlePlaceholder}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${inputClass} ${errors.title ? errBorder : ""}`}
                  />
                  {errors.title ? <p className="mt-1 text-sm text-red-400">{errors.title}</p> : null}
                </div>
                <div>
                  <label htmlFor="wiz-cat" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                    {t.categoryLabel}
                  </label>
                  <select
                    id="wiz-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${inputClass} ${errors.category ? errBorder : ""}`}
                  >
                    <option value="">{t.categoryPlaceholder}</option>
                    {t.categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {errors.category ? <p className="mt-1 text-sm text-red-400">{errors.category}</p> : null}
                </div>
                <div>
                  <label htmlFor="wiz-short" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                    {t.shortDescLabel}
                  </label>
                  <textarea
                    id="wiz-short"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value.slice(0, MAX_SHORT))}
                    rows={3}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${inputClass} ${errors.shortDescription ? errBorder : ""}`}
                  />
                  <p className={`mt-1 text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                    {shortDescription.length}/{MAX_SHORT} · {t.shortDescHelp}
                  </p>
                  {errors.shortDescription ? <p className="mt-1 text-sm text-red-400">{errors.shortDescription}</p> : null}
                </div>
                <div>
                  <label htmlFor="wiz-long" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                    {t.detailedDescLabel}
                  </label>
                  <textarea
                    id="wiz-long"
                    value={detailedDescription}
                    onChange={(e) => setDetailedDescription(e.target.value)}
                    rows={8}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${inputClass} ${errors.detailedDescription ? errBorder : ""}`}
                  />
                  <p className={`mt-1 text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                    {detailedDescription.trim().length} / {MIN_DETAILED}+ · {t.detailedDescHelp}
                  </p>
                  {errors.detailedDescription ? <p className="mt-1 text-sm text-red-400">{errors.detailedDescription}</p> : null}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-xl bg-primary-950 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary-900"
                  >
                    {t.next}
                  </button>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                <div>
                  <label htmlFor="wiz-goal" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                    {t.goalLabel}
                  </label>
                  <input
                    id="wiz-goal"
                    inputMode="numeric"
                    value={fundingGoal}
                    onChange={(e) => setFundingGoal(e.target.value)}
                    placeholder="25000"
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${inputClass} ${errors.fundingGoal ? errBorder : ""}`}
                  />
                  <p className={`mt-1 text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.goalHelp}</p>
                  {errors.fundingGoal ? <p className="mt-1 text-sm text-red-400">{errors.fundingGoal}</p> : null}
                </div>
                <div>
                  <label htmlFor="wiz-dur" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                    {t.durationLabel}
                  </label>
                  <select
                    id="wiz-dur"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as typeof duration)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${inputClass} ${errors.duration ? errBorder : ""}`}
                  >
                    <option value="">{t.selectPlaceholder}</option>
                    <option value="30">{t.duration30}</option>
                    <option value="45">{t.duration45}</option>
                    <option value="60">{t.duration60}</option>
                  </select>
                  {errors.duration ? <p className="mt-1 text-sm text-red-400">{errors.duration}</p> : null}
                </div>
                <div>
                  <label htmlFor="wiz-equity" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                    {t.equityLabel}: {equity}%
                  </label>
                  <input
                    id="wiz-equity"
                    type="range"
                    min={MIN_EQUITY}
                    max={MAX_EQUITY}
                    value={equity}
                    onChange={(e) => setEquity(Number(e.target.value))}
                    className="w-full accent-primary-950"
                  />
                  <p className={`mt-1 text-sm ${isDark ? "text-primary-300/90" : "text-primary-800"}`}>{t.equityPreview.replace("{pct}", String(equity))}</p>
                  {errors.equity ? <p className="mt-1 text-sm text-red-400">{errors.equity}</p> : null}
                </div>
                <div>
                  <p className={`mb-2 text-sm font-semibold ${labelClass}`}>{t.fundsTitle}</p>
                  <p className={`mb-3 text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.fundsHelp}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      [t.fundsMaterials, fundsMaterials, setFundsMaterials] as const,
                      [t.fundsDevelopment, fundsDevelopment, setFundsDevelopment] as const,
                      [t.fundsMarketing, fundsMarketing, setFundsMarketing] as const,
                      [t.fundsOther, fundsOther, setFundsOther] as const,
                    ].map(([lab, val, setVal]) => (
                      <div key={lab}>
                        <label className={`mb-1 block text-xs font-medium ${labelClass}`}>{lab}</label>
                        <input
                          inputMode="numeric"
                          value={val}
                          onChange={(e) => setVal(e.target.value)}
                          className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${inputClass} ${errors.funds ? errBorder : ""}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className={`mt-2 text-sm font-medium ${isDark ? "text-zinc-300" : "text-zinc-800"}`}>
                    {t.fundsSum}: {fundsTotal !== null ? fundsTotal.toLocaleString() : "—"} ETB
                    {goalNum !== null ? ` / ${goalNum.toLocaleString()} ETB` : ""}
                  </p>
                  {errors.funds ? <p className="mt-1 text-sm text-red-400">{errors.funds}</p> : null}
                </div>
                <div className="flex flex-wrap justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={goBack}
                    className={`rounded-xl border px-6 py-3 text-sm font-semibold ${isDark ? "border-white/20 bg-white/5 hover:bg-white/10" : "border-zinc-300 bg-white hover:bg-zinc-50"}`}
                  >
                    {t.back}
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-xl bg-primary-950 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary-900"
                  >
                    {t.next}
                  </button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <fieldset className={`space-y-3 rounded-xl border p-4 ${isDark ? "border-white/15 bg-zinc-950/30" : "border-zinc-200 bg-zinc-50/80"}`}>
                  <legend className={`px-1 text-sm font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.riskSectionTitle}</legend>
                  {[
                    [riskMarket, setRiskMarket, t.riskMarket] as const,
                    [riskExecution, setRiskExecution, t.riskExecution] as const,
                    [riskFinancial, setRiskFinancial, t.riskFinancial] as const,
                    [riskRegulatory, setRiskRegulatory, t.riskRegulatory] as const,
                  ].map(([checked, setC, lab], idx) => (
                    <label key={idx} className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
                      <input type="checkbox" checked={checked} onChange={(e) => setC(e.target.checked)} className="mt-1 h-4 w-4 rounded border-zinc-500 text-primary-600" />
                      <span className={`text-sm ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{lab}</span>
                    </label>
                  ))}
                  {errors.risks ? <p className="text-sm text-red-400">{errors.risks}</p> : null}
                </fieldset>
                <div>
                  <label htmlFor="wiz-risk-notes" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                    {t.riskNotesLabel}
                  </label>
                  <textarea
                    id="wiz-risk-notes"
                    value={riskNotes}
                    onChange={(e) => setRiskNotes(e.target.value)}
                    rows={4}
                    placeholder={t.riskNotesPlaceholder}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${inputClass}`}
                  />
                </div>
                <div>
                  <p className={`mb-2 text-sm font-medium ${labelClass}`}>{t.riskLevelLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {(["low", "medium", "high"] as const).map((lvl) => (
                      <label
                        key={lvl}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
                          riskLevel === lvl
                            ? "border-primary-500 bg-primary-950 text-white"
                            : isDark
                              ? "border-white/15 bg-zinc-950/40 text-zinc-200"
                              : "border-zinc-200 bg-white text-zinc-800"
                        } ${errors.riskLevel ? errBorder : ""}`}
                      >
                        <input type="radio" name="riskLevel" checked={riskLevel === lvl} onChange={() => setRiskLevel(lvl)} className="sr-only" />
                        {lvl === "low" ? t.riskLow : lvl === "medium" ? t.riskMedium : t.riskHigh}
                      </label>
                    ))}
                  </div>
                  {errors.riskLevel ? <p className="mt-1 text-sm text-red-400">{errors.riskLevel}</p> : null}
                </div>

                <div className={`rounded-xl border p-4 ${isDark ? "border-white/15 bg-black/20" : "border-zinc-200 bg-zinc-50"}`}>
                  <h3 className={`mb-3 text-sm font-bold uppercase tracking-wide ${isDark ? "text-primary-300" : "text-primary-800"}`}>{t.reviewTitle}</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className={isDark ? "text-zinc-500" : "text-zinc-500"}>{t.titleLabel}</dt>
                      <dd className={`font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>{title || "—"}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className={isDark ? "text-zinc-500" : "text-zinc-500"}>{t.reviewCategory}</dt>
                      <dd className={`font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>{categoryLabel}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className={isDark ? "text-zinc-500" : "text-zinc-500"}>{t.shortDescLabel}</dt>
                      <dd className={`max-w-md font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>{shortDescription || "—"}</dd>
                    </div>
                    <div>
                      <dt className={isDark ? "text-zinc-500" : "text-zinc-500"}>{t.detailedDescLabel}</dt>
                      <dd className={`mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap text-xs ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                        {detailedDescription || "—"}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className={isDark ? "text-zinc-500" : "text-zinc-500"}>{t.reviewGoal}</dt>
                      <dd className={`font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>
                        {goalNum !== null ? `${goalNum.toLocaleString()} ETB` : "—"}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className={isDark ? "text-zinc-500" : "text-zinc-500"}>{t.reviewDuration}</dt>
                      <dd className={`font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>{durationLabel}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className={isDark ? "text-zinc-500" : "text-zinc-500"}>{t.reviewEquity}</dt>
                      <dd className={`font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>{equity}%</dd>
                    </div>
                    <div>
                      <dt className={isDark ? "text-zinc-500" : "text-zinc-500"}>{t.fundsTitle}</dt>
                      <dd className={`mt-1 space-y-1 text-xs ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                        <p>
                          {t.fundsMaterials}: {fundsParts.m !== null ? fundsParts.m.toLocaleString() : "—"} ETB
                        </p>
                        <p>
                          {t.fundsDevelopment}: {fundsParts.d !== null ? fundsParts.d.toLocaleString() : "—"} ETB
                        </p>
                        <p>
                          {t.fundsMarketing}: {fundsParts.mk !== null ? fundsParts.mk.toLocaleString() : "—"} ETB
                        </p>
                        <p>
                          {t.fundsOther}: {fundsParts.o !== null ? fundsParts.o.toLocaleString() : "—"} ETB
                        </p>
                      </dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className={isDark ? "text-zinc-500" : "text-zinc-500"}>{t.reviewRiskLevel}</dt>
                      <dd className={`font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>{riskLevelLabel}</dd>
                    </div>
                    {riskNotes.trim() ? (
                      <div>
                        <dt className={isDark ? "text-zinc-500" : "text-zinc-500"}>{t.riskNotesLabel}</dt>
                        <dd className={`mt-1 text-xs ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{riskNotes}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                <div className="flex flex-wrap justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={goBack}
                    className={`rounded-xl border px-6 py-3 text-sm font-semibold ${isDark ? "border-white/20 bg-white/5 hover:bg-white/10" : "border-zinc-300 bg-white hover:bg-zinc-50"}`}
                  >
                    {t.back}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="rounded-xl bg-primary-950 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary-900"
                  >
                    {t.submitReview}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
