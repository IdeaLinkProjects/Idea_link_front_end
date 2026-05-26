import clsx from "clsx";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Leaf,
  Lightbulb,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useCallback, useState } from "react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";
import { LandingHeroBackground } from "./LandingHeroBackground";

type Audience = "invest" | "innovate";

const SECTOR_ICONS = [Leaf, Zap, Lightbulb, ShieldCheck, BarChart3, TrendingUp] as const;

function discoveryHref(keyword?: string): string {
  const q = keyword?.trim();
  return q ? `/discovery?q=${encodeURIComponent(q)}` : "/discovery";
}

export function LandingPage() {
  const { locale, isDark } = useAppPreferences();
  const router = useRouter();
  const t = messages[locale].landing;
  const [audience, setAudience] = useState<Audience>("invest");
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const isInvest = audience === "invest";
  const heroTitle = isInvest ? t.heroInvestTitle : t.heroInnovateTitle;
  const heroSubtitle = isInvest ? t.heroInvestSubtitle : t.heroInnovateSubtitle;
  const heroCta = isInvest ? t.heroCtaInvest : t.heroCtaInnovate;
  const heroCtaHref = isInvest ? "/discovery" : "/register";
  const howSteps = isInvest ? t.howItWorksInvest : t.howItWorksInnovate;

  const goToDiscovery = useCallback(
    (keyword?: string) => {
      void router.push(discoveryHref(keyword));
    },
    [router],
  );

  const onSubmitSearch = (e: FormEvent) => {
    e.preventDefault();
    goToDiscovery(query);
  };

  const section = isDark ? "text-zinc-100" : "text-zinc-900";
  const muted = isDark ? "text-zinc-400" : "text-zinc-600";
  const card = isDark
    ? "rounded-2xl border border-white/10 bg-zinc-900/50 shadow-lg shadow-black/20"
    : "rounded-2xl border border-zinc-200/90 bg-white shadow-md shadow-zinc-900/[0.04]";
  const pillActive = "border-primary-600 bg-primary-600 text-white shadow-md shadow-primary-900/25";
  const heroPillInactive = "border-transparent bg-transparent text-zinc-200 hover:bg-white/10";

  return (
    <div className={clsx("flex flex-col", section)}>
      {/* Hero */}
      <section className="relative min-h-[28rem] overflow-hidden px-4 pb-16 pt-24 sm:min-h-[32rem] sm:px-5 sm:pb-20 sm:pt-28 lg:px-6 lg:pb-24">
        <LandingHeroBackground />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div
            className="mx-auto mb-8 inline-flex rounded-full border border-white/20 bg-black/40 p-1 backdrop-blur-md"
            role="tablist"
            aria-label="Audience"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isInvest}
              className={clsx(
                "rounded-full px-5 py-2 text-sm font-semibold transition",
                isInvest ? pillActive : heroPillInactive,
              )}
              onClick={() => setAudience("invest")}
            >
              {t.audienceInvest}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isInvest}
              className={clsx(
                "rounded-full px-5 py-2 text-sm font-semibold transition",
                !isInvest ? pillActive : heroPillInactive,
              )}
              onClick={() => setAudience("innovate")}
            >
              {t.audienceInnovate}
            </button>
          </div>

          <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            {heroTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-zinc-200 sm:text-lg">
            {heroSubtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={heroCtaHref}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-900/25 transition hover:bg-primary-500 hover:-translate-y-0.5"
            >
              {heroCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              {t.finalCtaSignUp}
            </Link>
          </div>

          <form onSubmit={onSubmitSearch} className="mx-auto mt-10 max-w-2xl">
            <div className="flex overflow-hidden rounded-2xl border border-white/20 bg-zinc-900/80 shadow-lg shadow-black/30 backdrop-blur-md transition focus-within:ring-2 focus-within:ring-primary-400/50">
              <span className="flex items-center pl-4 text-zinc-400" aria-hidden>
                <Search className="h-5 w-5" />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-4 text-base text-white outline-none placeholder:text-zinc-500"
                aria-label={t.searchPlaceholder}
              />
              <button
                type="submit"
                className="shrink-0 bg-primary-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-primary-500 sm:px-8"
              >
                {t.searchSubmit}
              </button>
            </div>
          </form>

          <div className="mt-8 text-left sm:text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">{t.popularSearches}</p>
            <ul className="mt-3 flex flex-wrap justify-center gap-2">
              {t.popularQueries.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(label);
                      goToDiscovery(label);
                    }}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-left text-xs font-medium text-zinc-100 transition hover:-translate-y-0.5 hover:border-primary-400/50 hover:bg-primary-500/20 sm:text-sm"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-10 text-sm font-medium text-zinc-300">{t.trustedBy}</p>
        </div>
      </section>

      {/* Categories */}
      <section className={`border-y px-4 py-16 sm:px-5 lg:px-6 ${isDark ? "border-white/10 bg-zinc-900/30" : "border-zinc-200/80 bg-zinc-100/50"}`}>
        <div className="mx-auto max-w-screen-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.categoriesTitle}</h2>
              <p className={clsx("mt-2 max-w-xl text-sm sm:text-base", muted)}>{t.categoriesSubtitle}</p>
            </div>
            <Link
              href="/discovery"
              className="inline-flex w-fit items-center gap-1 text-sm font-bold text-primary-600 transition hover:text-primary-500 dark:text-primary-400"
            >
              {t.categoriesCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className={clsx(card, "p-6 sm:p-8")}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                {t.emergingTitle}
              </h3>
              <ul className="mt-5 space-y-4">
                {t.emergingRoles.map((role) => (
                  <li key={role.title} className="flex gap-3 border-b border-dashed pb-4 last:border-0 last:pb-0 dark:border-white/10">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500/15 text-primary-600 dark:text-primary-300">
                      <Sparkles className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <p className="font-semibold">{role.title}</p>
                      <p className={clsx("mt-0.5 text-sm", muted)}>{role.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className={clsx(card, "p-6 sm:p-8")}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                {t.inDemandTitle}
              </h3>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {t.inDemandSectors.map((sector, i) => {
                  const Icon = SECTOR_ICONS[i] ?? Sparkles;
                  return (
                    <button
                      key={sector}
                      type="button"
                      onClick={() => goToDiscovery(sector)}
                      className={clsx(
                        "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition hover:-translate-y-0.5",
                        isDark
                          ? "border-white/10 bg-white/[0.03] hover:border-primary-500/35 hover:bg-primary-500/10"
                          : "border-zinc-200/90 bg-zinc-50/80 hover:border-primary-300 hover:bg-primary-50",
                      )}
                    >
                      <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden />
                      <span className="text-sm font-semibold">{sector}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats + testimonial */}
      <section className="px-4 py-16 sm:px-5 lg:px-6">
        <div className="mx-auto grid max-w-screen-2xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className={clsx(card, "relative overflow-hidden p-8 sm:p-10")}>
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-500/20 blur-3xl" aria-hidden />
            <Users className="h-8 w-8 text-primary-500" aria-hidden />
            <blockquote className="relative mt-6 text-lg font-medium leading-relaxed sm:text-xl">
              &ldquo;{t.testimonialQuote}&rdquo;
            </blockquote>
            <footer className="relative mt-6">
              <p className="font-bold">{t.testimonialAuthor}</p>
              <p className={clsx("text-sm", muted)}>{t.testimonialRole}</p>
            </footer>
            <Link
              href="/discovery"
              className="relative mt-6 inline-block text-sm font-bold text-primary-600 dark:text-primary-400"
            >
              {t.testimonialCta} →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {t.stats.map((stat) => (
              <div key={stat.label} className={clsx(card, "p-5 text-center sm:p-6")}>
                <p className="text-3xl font-extrabold tracking-tight text-primary-600 dark:text-primary-400 sm:text-4xl">
                  {stat.value}
                </p>
                <p className={clsx("mt-1 text-xs font-semibold uppercase tracking-wide sm:text-sm", muted)}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={`px-4 py-16 sm:px-5 lg:px-6 ${isDark ? "bg-zinc-900/40" : "bg-primary-50/40"}`}>
        <div className="mx-auto max-w-screen-2xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.howItWorksTitle}</h2>
          <ol className="mt-12 grid gap-6 text-left sm:grid-cols-3">
            {howSteps.map((step) => (
              <li key={step.title} className={clsx(card, "p-6")}>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                  {step.step}
                </span>
                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                <p className={clsx("mt-2 text-sm leading-relaxed", muted)}>{step.desc}</p>
              </li>
            ))}
          </ol>
          <Link
            href="/register"
            className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-primary-700 transition hover:text-primary-600 dark:text-primary-300"
          >
            {t.howItWorksCta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Paths */}
      <section className="px-4 py-16 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-screen-2xl">
          <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">{t.pathsTitle}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className={clsx(card, "flex flex-col p-8")}>
              <BarChart3 className="h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden />
              <h3 className="mt-4 text-xl font-bold">{t.pathInvestorTitle}</h3>
              <p className={clsx("mt-2 flex-1 text-sm leading-relaxed", muted)}>{t.pathInvestorDesc}</p>
              <Link
                href="/register"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl border border-primary-600/30 bg-primary-50 px-5 py-2.5 text-sm font-bold text-primary-900 transition hover:bg-primary-100 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-100 dark:hover:bg-primary-500/20"
              >
                {t.pathInvestorCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div
              className={clsx(
                card,
                "flex flex-col border-primary-500/30 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 p-8 text-white",
              )}
            >
              <Lightbulb className="h-8 w-8 text-primary-100" aria-hidden />
              <h3 className="mt-4 text-xl font-bold">{t.pathInnovatorTitle}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/85">{t.pathInnovatorDesc}</p>
              <Link
                href="/register"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary-900 transition hover:bg-primary-50"
              >
                {t.pathInnovatorCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={`border-t px-4 py-16 sm:px-5 lg:px-6 ${isDark ? "border-white/10" : "border-zinc-200"}`}>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">{t.faqTitle}</h2>
          <ul className="mt-10 space-y-3">
            {t.faqItems.map((item, i) => {
              const open = openFaq === i;
              return (
                <li key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className={clsx(
                      "flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left text-sm font-semibold transition sm:text-base",
                      isDark ? "border-white/10 bg-zinc-900/50 hover:bg-zinc-900" : "border-zinc-200 bg-white hover:bg-zinc-50",
                    )}
                    aria-expanded={open}
                  >
                    {item.q}
                    <ChevronDown
                      className={clsx("h-5 w-5 shrink-0 text-primary-600 transition dark:text-primary-400", open && "rotate-180")}
                      aria-hidden
                    />
                  </button>
                  {open ? (
                    <p className={clsx("px-5 pb-4 pt-2 text-sm leading-relaxed", muted)}>{item.a}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-8 sm:px-5 lg:px-6">
        <div
          className={clsx(
            "mx-auto max-w-screen-2xl rounded-3xl px-6 py-12 text-center sm:px-10 sm:py-14",
            "bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white shadow-xl shadow-primary-950/30",
          )}
        >
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.finalCtaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 sm:text-base">{t.finalCtaSubtitle}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/discovery"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary-900 transition hover:bg-primary-50"
            >
              {t.finalCtaExplore}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              {t.finalCtaSignUp}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
