import clsx from "clsx";
import {
  ArrowRight,
  Check,
  ChevronDown,
  GraduationCap,
  Heart,
  Leaf,
  ListChecks,
  Lock,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import type { Locale } from "@/locales";
import { messages } from "@/locales";
import {
  type CampaignFilterRequestBody,
  type MyCampaign,
  useFilterCampaignsQuery,
} from "@/store";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80&auto=format&fit=crop";

const LIVE_CAMPAIGNS_QUERY: CampaignFilterRequestBody = {
  pagination: { page: 0, size: 3 },
  filters: {
    keyword: "",
    statuses: [],
    tagIds: [],
    activeNow: true,
    funded: false,
  },
};

function discoveryHref(keyword?: string): string {
  const q = keyword?.trim();
  return q ? `/discovery?q=${encodeURIComponent(q)}` : "/discovery";
}

function formatEtb(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "am" ? "am-ET" : "en-ET", { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  );
}

function daysRemaining(iso: string): number {
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

type FallbackCampaign = (typeof messages.en.landing)["featuredCampaigns"][number];

type LandingCampaign = {
  id: string;
  title: string;
  categoryLabel: string;
  location: string;
  fundedPercent: number;
  daysRemaining: number;
  raisedEtb: number;
  minInvestEtb: number;
  image: string;
  href: string;
};

function campaignFromApi(c: MyCampaign, locale: Locale): LandingCampaign {
  const tag = c.tags?.[0] ?? "";
  const categoryLabel = tag || c.company?.industry || "—";
  return {
    id: String(c.id),
    title: c.title,
    categoryLabel,
    location: c.company?.name ?? "Ethiopia",
    fundedPercent: Math.min(100, Math.max(0, Math.round(c.fundingProgress ?? 0))),
    daysRemaining: daysRemaining(c.endDate),
    raisedEtb: c.amountRaised ?? 0,
    minInvestEtb: c.minInvestment ?? 0,
    image:
      c.heroImageUrl?.trim() ||
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop",
    href: `/projects/${c.id}`,
  };
}

function campaignFromFallback(c: FallbackCampaign): LandingCampaign {
  return {
    id: c.title,
    title: c.title,
    categoryLabel: c.category,
    location: c.location,
    fundedPercent: c.fundedPercent,
    daysRemaining: c.daysRemaining,
    raisedEtb: c.raisedEtb,
    minInvestEtb: c.minInvestEtb,
    image: c.image,
    href: "/discovery",
  };
}

function LandingCampaignCard({
  campaign,
  locale,
  isDark,
  t,
  cardClass,
  muted,
}: {
  campaign: LandingCampaign;
  locale: Locale;
  isDark: boolean;
  t: (typeof messages.en.landing);
  cardClass: string;
  muted: string;
}) {
  return (
    <Link href={campaign.href} className={clsx(cardClass, "group flex flex-col overflow-hidden transition hover:-translate-y-0.5")}>
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote campaign imagery */}
        <img
          src={campaign.image}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
          {t.liveBadge}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className={clsx("text-xs font-medium", muted)}>
          {campaign.categoryLabel} • {campaign.location}
        </p>
        <h3 className="mt-1.5 text-lg font-bold leading-snug">{campaign.title}</h3>
        <div className="mt-4">
          <div className={clsx("h-1.5 w-full overflow-hidden rounded-full", isDark ? "bg-zinc-800" : "bg-zinc-200")}>
            <div
              className="h-full rounded-full bg-primary-600"
              style={{ width: `${campaign.fundedPercent}%` }}
            />
          </div>
          <div className={clsx("mt-2 flex items-center justify-between text-xs font-semibold", muted)}>
            <span>{campaign.fundedPercent}% {t.fundedLabel}</span>
            <span>
              {campaign.daysRemaining} {t.daysLeftLabel}
            </span>
          </div>
        </div>
        <div className={clsx("mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-xs", isDark ? "border-white/10" : "border-zinc-100")}>
          <div>
            <p className={clsx("font-bold uppercase tracking-wide", muted)}>{t.raisedLabel}</p>
            <p className="mt-0.5 text-sm font-bold text-primary-800 dark:text-primary-300">
              {formatEtb(campaign.raisedEtb, locale)} ETB
            </p>
          </div>
          <div>
            <p className={clsx("font-bold uppercase tracking-wide", muted)}>{t.minInvestLabel}</p>
            <p className="mt-0.5 text-sm font-bold text-primary-800 dark:text-primary-300">
              {formatEtb(campaign.minInvestEtb, locale)} ETB
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function LandingPage() {
  const { locale, isDark } = useAppPreferences();
  const router = useRouter();
  const t = messages[locale].landing;
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { data: liveData, isLoading: liveLoading } = useFilterCampaignsQuery(LIVE_CAMPAIGNS_QUERY);

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

  const campaigns = useMemo((): LandingCampaign[] => {
    const apiItems = liveData?.content ?? [];
    if (apiItems.length > 0) {
      return apiItems.map((c) => campaignFromApi(c, locale));
    }
    return t.featuredCampaigns.map(campaignFromFallback);
  }, [liveData?.content, locale, t.featuredCampaigns]);

  const stats = useMemo(() => {
    const liveCount = liveData?.totalElements;
    return t.stats.map((stat, i) =>
      i === 0 && liveCount != null ? { ...stat, value: String(liveCount) } : stat,
    );
  }, [liveData?.totalElements, t.stats]);

  const section = isDark ? "text-zinc-100" : "text-zinc-900";
  const muted = isDark ? "text-zinc-400" : "text-zinc-500";
  const card = isDark
    ? "rounded-2xl border border-white/10 bg-zinc-900/60 shadow-lg shadow-black/20"
    : "rounded-2xl border border-zinc-200/80 bg-white shadow-md shadow-zinc-900/[0.05]";
  const mintSection = isDark ? "bg-primary-950/25" : "bg-primary-50";

  const transparencyIcons = [ShieldCheck, ListChecks, Lock, Wallet] as const;
  const sectorIcons = [Leaf, Wallet, Heart, GraduationCap, Zap, Store] as const;
  const sectionX = "px-8 sm:px-12 lg:px-16";

  return (
    <div className={clsx("flex flex-col", section)}>
      {/* Hero */}
      <section className={clsx(sectionX, "pb-12 pt-6 sm:pb-14 sm:pt-8", isDark ? "bg-zinc-950" : "bg-[#f7faf8]")}>
        <div className="mx-auto grid max-w-screen-2xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <span
              className={clsx(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                isDark ? "border-primary-500/30 bg-primary-950/50 text-primary-200" : "border-primary-200 bg-white text-primary-800",
              )}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary-600" aria-hidden />
              {t.heroBadge}
            </span>

            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
              {t.heroTitle}
            </h1>
            <p className={clsx("mt-5 max-w-xl text-pretty text-base leading-relaxed sm:text-lg", muted)}>
              {t.heroSubtitle}
            </p>

            <form onSubmit={onSubmitSearch} className="mt-8 max-w-xl">
              <div
                className={clsx(
                  "flex overflow-hidden rounded-xl border shadow-sm transition focus-within:ring-2 focus-within:ring-primary-500/30",
                  isDark ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-white",
                )}
              >
                <span className={clsx("flex items-center pl-4", muted)} aria-hidden>
                  <Search className="h-5 w-5" />
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className={clsx(
                    "min-w-0 flex-1 border-0 bg-transparent px-3 py-3.5 text-base outline-none",
                    isDark ? "text-white placeholder:text-zinc-500" : "text-zinc-900 placeholder:text-zinc-400",
                  )}
                  aria-label={t.searchPlaceholder}
                />
                <button
                  type="submit"
                  className="shrink-0 bg-primary-800 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-primary-700 sm:px-7"
                >
                  {t.searchSubmit}
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className={clsx("text-sm font-medium", muted)}>{t.popularLabel}</span>
              {t.popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setQuery(tag);
                    goToDiscovery(tag);
                  }}
                  className={clsx(
                    "rounded-full border px-3 py-1 text-sm font-medium transition hover:-translate-y-0.5",
                    isDark
                      ? "border-white/15 bg-white/5 text-zinc-200 hover:border-primary-500/40 hover:bg-primary-950/50"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-primary-300 hover:bg-primary-50",
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/discovery"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-800 px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary-900/20 transition hover:bg-primary-700 hover:-translate-y-0.5"
              >
                {t.heroCtaExplore}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/register"
                className={clsx(
                  "inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5",
                  isDark
                    ? "border-primary-500/40 text-primary-200 hover:bg-primary-950/40"
                    : "border-primary-800 text-primary-900 hover:bg-primary-50",
                )}
              >
                {t.heroCtaSignUp}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none lg:justify-self-end">
            <div
              className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-primary-200/40 blur-2xl dark:bg-primary-800/20"
              aria-hidden
            />
            <div className="relative rotate-2 transition hover:rotate-1">
              <div className={clsx("overflow-hidden rounded-3xl shadow-2xl shadow-primary-900/15 ring-1", isDark ? "ring-white/10" : "ring-black/5")}>
                {/* eslint-disable-next-line @next/next/no-img-element -- marketing hero photography */}
                <img src={HERO_IMAGE} alt="" className="aspect-[4/3] w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className={clsx(sectionX, "py-10", mintSection)}>
        <div className="mx-auto max-w-screen-2xl">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-extrabold tracking-tight text-primary-800 dark:text-primary-300 sm:text-5xl">
                  {stat.value}
                </p>
                <p className={clsx("mt-1 text-sm font-medium", muted)}>{stat.label}</p>
              </div>
            ))}
          </div>
          <p className={clsx("mt-8 text-center text-xs", muted)}>{t.statsFootnote}</p>
        </div>
      </section>

      {/* Live campaigns */}
      <section className={clsx(sectionX, "py-16")}>
        <div className="mx-auto max-w-screen-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.liveCampaignsTitle}</h2>
            <Link
              href="/discovery"
              className="inline-flex w-fit items-center gap-1 text-sm font-bold text-primary-700 transition hover:text-primary-600 dark:text-primary-400"
            >
              {t.liveCampaignsViewAll}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {liveLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={clsx(card, "h-[22rem] animate-pulse")} aria-hidden />
                ))
              : campaigns.map((campaign) => (
                  <LandingCampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    locale={locale}
                    isDark={isDark}
                    t={t}
                    cardClass={card}
                    muted={muted}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* Built for transparency */}
      <section className={clsx(sectionX, "py-16", mintSection)}>
        <div className="mx-auto max-w-screen-2xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.transparencyTitle}</h2>
          <p className={clsx("mx-auto mt-3 max-w-2xl text-sm leading-relaxed sm:text-base", muted)}>
            {t.transparencySubtitle}
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.transparencyFeatures.map((feature, i) => {
              const Icon = transparencyIcons[i] ?? ShieldCheck;
              return (
                <div key={feature.title} className={clsx(card, "p-6 text-left")}>
                  <span
                    className={clsx(
                      "inline-flex h-11 w-11 items-center justify-center rounded-full",
                      isDark ? "bg-primary-900/50 text-primary-300" : "bg-primary-100 text-primary-800",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-bold">{feature.title}</h3>
                  <p className={clsx("mt-2 text-sm leading-relaxed", muted)}>{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={clsx(sectionX, "py-16")}>
        <div className="mx-auto max-w-screen-2xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.howItWorksTitle}</h2>
          <ol className="relative mt-14 grid gap-10 text-left md:grid-cols-3 md:gap-8">
            <div
              className={clsx(
                "pointer-events-none absolute top-5 right-[16%] left-[16%] hidden h-px md:block",
                isDark ? "bg-primary-800" : "bg-primary-200",
              )}
              aria-hidden
            />
            {t.howItWorksSteps.map((step) => (
              <li key={step.title} className="relative flex flex-col items-center text-center md:items-center">
                <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-800 text-sm font-bold text-white shadow-md shadow-primary-900/20">
                  {step.step}
                </span>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className={clsx("mt-2 max-w-xs text-sm leading-relaxed", muted)}>{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Browse by sector */}
      <section className={clsx(sectionX, "py-16", mintSection)}>
        <div className="mx-auto max-w-screen-2xl">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.sectorsTitle}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.sectors.map((sector, i) => {
              const Icon = sectorIcons[i] ?? Leaf;
              return (
                <button
                  key={sector.name}
                  type="button"
                  onClick={() => goToDiscovery(sector.keyword)}
                  className={clsx(
                    card,
                    "group flex flex-col items-start p-6 text-left transition hover:-translate-y-0.5",
                  )}
                >
                  <span
                    className={clsx(
                      "inline-flex h-10 w-10 items-center justify-center rounded-xl",
                      isDark ? "bg-primary-900/50 text-primary-300" : "bg-primary-100 text-primary-800",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{sector.name}</h3>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-700 transition group-hover:gap-2 dark:text-primary-400">
                    {t.sectorsBrowse}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Investor / Innovator paths */}
      <section className={clsx(sectionX, "py-16")}>
        <div className="mx-auto grid max-w-screen-2xl gap-6 lg:grid-cols-2">
          <div
            className={clsx(
              "relative overflow-hidden rounded-3xl p-8 sm:p-10",
              "bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white shadow-xl shadow-primary-950/25",
            )}
          >
            <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10" aria-hidden />
            <p className="text-sm font-semibold text-primary-100">{t.pathInvestorEyebrow}</p>
            <ul className="mt-6 space-y-4">
              {t.pathInvestorBenefits.map((benefit) => (
                <li key={benefit} className="flex gap-3 text-sm leading-relaxed text-white/90 sm:text-base">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-primary-900 transition hover:bg-primary-50"
            >
              {t.pathInvestorCta}
            </Link>
          </div>

          <div
            className={clsx(
              "relative overflow-hidden rounded-3xl p-8 sm:p-10",
              isDark ? "bg-zinc-900/60 text-zinc-100" : "bg-zinc-100 text-zinc-900",
            )}
          >
            <div
              className={clsx(
                "pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full",
                isDark ? "bg-primary-800/30" : "bg-primary-200/60",
              )}
              aria-hidden
            />
            <p className={clsx("text-sm font-semibold", isDark ? "text-primary-300" : "text-primary-800")}>
              {t.pathInnovatorEyebrow}
            </p>
            <ul className="mt-6 space-y-4">
              {t.pathInnovatorBenefits.map((benefit) => (
                <li key={benefit} className={clsx("flex gap-3 text-sm leading-relaxed sm:text-base", muted)}>
                  <span
                    className={clsx(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      isDark ? "bg-primary-900/50 text-primary-300" : "bg-primary-200 text-primary-900",
                    )}
                  >
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 inline-flex rounded-full bg-primary-800 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-700"
            >
              {t.pathInnovatorCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className={clsx(sectionX, "py-16")}>
        <div
          className={clsx(
            card,
            "mx-auto grid max-w-screen-2xl overflow-hidden lg:grid-cols-2",
          )}
        >
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            <Quote className="h-10 w-10 text-primary-600 dark:text-primary-400" aria-hidden />
            <blockquote className="mt-6 text-xl font-bold leading-snug sm:text-2xl">
              &ldquo;{t.testimonialQuote}&rdquo;
            </blockquote>
            <div className="mt-8 flex items-center gap-4">
              <div
                className={clsx(
                  "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold",
                  isDark ? "bg-primary-900/50 text-primary-200" : "bg-primary-100 text-primary-800",
                )}
              >
                {t.testimonialAuthor
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <p className="font-bold">{t.testimonialAuthor}</p>
                <p className={clsx("text-sm", muted)}>{t.testimonialRole}</p>
              </div>
            </div>
            <Link
              href="/discovery"
              className="mt-6 inline-flex w-fit items-center gap-1 text-sm font-bold text-primary-700 transition hover:gap-2 dark:text-primary-400"
            >
              {t.testimonialCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="relative min-h-[16rem] lg:min-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element -- marketing testimonial photography */}
            <img
              src={t.testimonialImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={clsx(sectionX, "py-16", mintSection)}>
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
                      "flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition sm:text-base",
                      isDark
                        ? "border-white/10 bg-zinc-900/60 hover:bg-zinc-900"
                        : "border-zinc-200/80 bg-white hover:bg-zinc-50",
                    )}
                    aria-expanded={open}
                  >
                    {item.q}
                    <ChevronDown
                      className={clsx(
                        "h-5 w-5 shrink-0 text-primary-600 transition dark:text-primary-400",
                        open && "rotate-180",
                      )}
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
      <section className={clsx(sectionX, "pb-16")}>
        <div
          className={clsx(
            "relative mx-auto max-w-screen-2xl overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-10 sm:py-16",
            "bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white shadow-xl shadow-primary-950/30",
          )}
        >
          <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/5" aria-hidden />
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-white/5" aria-hidden />
          <h2 className="relative text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">{t.finalCtaTitle}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm text-white/85 sm:text-base">{t.finalCtaSubtitle}</p>
          <Link
            href="/register"
            className="relative mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-bold text-primary-900 transition hover:bg-primary-50"
          >
            {t.finalCtaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}
