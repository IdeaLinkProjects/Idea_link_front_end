import Link from "next/link";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import type { Locale } from "@/locales";
import { messages } from "@/locales";
import {
  CAMPAIGN_FILTER_STATUS_OPTIONS,
  type CampaignFilterFilters,
  type CampaignFilterRequestBody,
  type MyCampaign,
  useFilterCampaignsQuery,
  useGetCampaignTagsQuery,
} from "@/store";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

function useDebouncedValue(value: string, ms: number): string {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return v;
}

function formatEtb(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "am" ? "am-ET" : "en-ET", { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  );
}

function formatDateShort(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale === "am" ? "am-ET" : "en-ET", { year: "numeric", month: "short", day: "numeric" });
}

function daysRemaining(iso: string): number {
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

function optionalIsoFromDateInput(dateStr: string): string | undefined {
  const t = dateStr.trim();
  if (!t) return undefined;
  const d = new Date(`${t}T12:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function parseOptionalPositiveInt(s: string): number | undefined {
  const t = s.trim();
  if (!t) return undefined;
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

export type HomeDiscoverySectionProps = {
  /** Pre-fill search from landing hero or `?q=` URL param */
  initialKeyword?: string;
};

export function HomeDiscoverySection({ initialKeyword = "" }: HomeDiscoverySectionProps) {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale];
  const d = t.discovery;
  const fu = d.filterUi;

  const [keyword, setKeyword] = useState(initialKeyword);
  useEffect(() => {
    if (initialKeyword) setKeyword(initialKeyword);
  }, [initialKeyword]);

  const debouncedKeyword = useDebouncedValue(keyword, 400);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [startDateFrom, setStartDateFrom] = useState("");
  const [startDateTo, setStartDateTo] = useState("");
  const [endDateFrom, setEndDateFrom] = useState("");
  const [endDateTo, setEndDateTo] = useState("");
  const [fundingMin, setFundingMin] = useState("");
  const [fundingMax, setFundingMax] = useState("");
  const [investMin, setInvestMin] = useState("");
  const [investMax, setInvestMax] = useState("");
  const [activeNow, setActiveNow] = useState(false);
  const [funded, setFunded] = useState(false);
  const [page, setPage] = useState(0);

  const tagsQuery = useGetCampaignTagsQuery();

  const filters: CampaignFilterFilters = useMemo(() => {
    const f: CampaignFilterFilters = {
      keyword: debouncedKeyword.trim(),
      statuses: [...statuses],
      tagIds: [...tagIds],
      activeNow,
      funded,
    };
    const sf = optionalIsoFromDateInput(startDateFrom);
    const st = optionalIsoFromDateInput(startDateTo);
    const ef = optionalIsoFromDateInput(endDateFrom);
    const et = optionalIsoFromDateInput(endDateTo);
    if (sf) f.startDateFrom = sf;
    if (st) f.startDateTo = st;
    if (ef) f.endDateFrom = ef;
    if (et) f.endDateTo = et;
    const nMin = parseOptionalPositiveInt(fundingMin);
    const nMax = parseOptionalPositiveInt(fundingMax);
    if (nMin != null) f.minFundingGoal = nMin;
    if (nMax != null) f.maxFundingGoal = nMax;
    const iMin = parseOptionalPositiveInt(investMin);
    const iMax = parseOptionalPositiveInt(investMax);
    if (iMin != null) f.minInvestment = iMin;
    if (iMax != null) f.maxInvestment = iMax;
    return f;
  }, [
    debouncedKeyword,
    statuses,
    tagIds,
    activeNow,
    funded,
    startDateFrom,
    startDateTo,
    endDateFrom,
    endDateTo,
    fundingMin,
    fundingMax,
    investMin,
    investMax,
  ]);

  const requestBody: CampaignFilterRequestBody = useMemo(
    () => ({
      pagination: { page, size: PAGE_SIZE },
      filters,
    }),
    [page, filters],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useFilterCampaignsQuery(requestBody);

  const campaigns = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? (Math.ceil(totalElements / PAGE_SIZE) || 1));

  useEffect(() => {
    queueMicrotask(() => {
      setPage(0);
    });
  }, [
    debouncedKeyword,
    statuses,
    tagIds,
    activeNow,
    funded,
    startDateFrom,
    startDateTo,
    endDateFrom,
    endDateTo,
    fundingMin,
    fundingMax,
    investMin,
    investMax,
  ]);

  const toggleStatus = useCallback((s: string) => {
    setStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }, []);

  const toggleTag = useCallback((id: number) => {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const resetFilters = useCallback(() => {
    setKeyword("");
    setStatuses([]);
    setTagIds([]);
    setStartDateFrom("");
    setStartDateTo("");
    setEndDateFrom("");
    setEndDateTo("");
    setFundingMin("");
    setFundingMax("");
    setInvestMin("");
    setInvestMax("");
    setActiveNow(false);
    setFunded(false);
    setPage(0);
  }, []);

  const panel = isDark
    ? "rounded-3xl border border-white/12 bg-zinc-900/40 p-5 shadow-xl shadow-black/20 ring-1 ring-white/[0.06] backdrop-blur-md sm:p-6"
    : "rounded-3xl border border-zinc-200/90 bg-white/90 p-5 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-primary-900/[0.04] backdrop-blur-sm sm:p-6";
  const panelCompact = isDark
    ? "rounded-3xl border border-white/12 bg-zinc-900/35 px-4 py-3 shadow-md ring-1 ring-white/[0.05] backdrop-blur-md sm:px-5 sm:py-4"
    : "rounded-3xl border border-zinc-200/90 bg-white/95 px-4 py-3 shadow-md ring-1 ring-primary-900/[0.03] backdrop-blur-sm sm:px-5 sm:py-4";
  const label = isDark ? "text-[11px] font-bold uppercase tracking-wider text-zinc-500" : "text-[11px] font-bold uppercase tracking-wider text-zinc-500";
  const input =
    "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/25 " +
    (isDark ? "border-white/15 bg-zinc-950/50 text-zinc-100 placeholder:text-zinc-500" : "border-zinc-200 bg-zinc-50/80 text-zinc-900 placeholder:text-zinc-400");
  const muted = isDark ? "text-zinc-400" : "text-zinc-600";
  const linkPrimary = isDark ? "text-primary-300 hover:text-primary-200" : "text-primary-700 hover:text-primary-800";
  const checkClass = "accent-primary-600 h-4 w-4 shrink-0 rounded border-zinc-400 text-primary-600 focus:ring-primary-500/40";

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
      <aside className={`w-full shrink-0 space-y-5 lg:sticky lg:top-24 lg:w-80 ${panel}`}>
        <div className="flex items-center gap-3 border-b border-dashed pb-4 dark:border-white/10">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-md shadow-primary-900/25">
            <SlidersHorizontal className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>{fu.sidebarTitle}</h2>
          </div>
        </div>
        <div>
          <p className={`${label} mb-2`}>{fu.keywordLabel}</p>
          <div className="relative">
            <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm ${muted}`} aria-hidden>
              ⌕
            </span>
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={d.searchPlaceholder}
              className={`${input} pl-9 pr-10`}
              aria-label={d.searchPlaceholder}
            />
            {keyword ? (
              <button
                type="button"
                onClick={() => setKeyword("")}
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold ${muted} transition hover:bg-zinc-200/80 dark:hover:bg-white/10`}
                aria-label={fu.clearKeyword}
              >
                ×
              </button>
            ) : null}
          </div>
        </div>

        <details className="group" open>
          <summary
            className={`flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition [&::-webkit-details-marker]:hidden ${
              isDark ? "border-white/12 bg-white/[0.04] text-zinc-100 hover:bg-white/[0.07]" : "border-zinc-200 bg-zinc-50/80 text-zinc-800 hover:border-primary-200/80 hover:bg-primary-50/40"
            }`}
          >
            <span>{fu.advancedSearch}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-primary-600 transition-transform duration-200 group-open:rotate-180 dark:text-primary-400" aria-hidden />
          </summary>
          <div className="mt-4 space-y-5 border-t border-dashed border-zinc-200/80 pt-4 dark:border-white/10">
            <div>
              <p className={`${label} mb-2`}>{fu.statusTitle}</p>
              <div className="flex flex-col gap-1.5">
                {CAMPAIGN_FILTER_STATUS_OPTIONS.map((s) => (
                  <label key={s} className={`flex cursor-pointer items-center gap-2.5 rounded-lg py-0.5 text-sm transition hover:bg-black/[0.04] dark:hover:bg-white/[0.04] ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                    <input type="checkbox" checked={statuses.includes(s)} onChange={() => toggleStatus(s)} className={checkClass} />
                    <span>{fu.statusLabels[s]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className={`${label} mb-2`}>{fu.tagsTitle}</p>
              <div className="max-h-48 space-y-1.5 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-color:rgba(16,185,129,0.45)_transparent] [scrollbar-width:thin] dark:[scrollbar-color:rgba(16,185,129,0.35)_transparent]">
                {tagsQuery.isLoading ? (
                  <p className={`text-sm ${muted}`}>…</p>
                ) : tagsQuery.data?.length ? (
                  tagsQuery.data.map((tag) => (
                    <label
                      key={tag.id}
                      className={`flex cursor-pointer items-center justify-between gap-2 text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <input type="checkbox" checked={tagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} className={checkClass} />
                        <span className="truncate">{tag.name}</span>
                      </span>
                      <span className={`shrink-0 text-xs tabular-nums ${muted}`}>({tag.campaignCount})</span>
                    </label>
                  ))
                ) : (
                  <p className={`text-sm ${muted}`}>{fu.tagsEmpty}</p>
                )}
              </div>
            </div>

            <div>
              <p className={`${label} mb-2`}>{fu.datesTitle}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <span className={`mb-1 block text-[11px] font-medium ${muted}`}>{fu.startFrom}</span>
                  <input type="date" value={startDateFrom} onChange={(e) => setStartDateFrom(e.target.value)} className={input} />
                </div>
                <div>
                  <span className={`mb-1 block text-[11px] font-medium ${muted}`}>{fu.startTo}</span>
                  <input type="date" value={startDateTo} onChange={(e) => setStartDateTo(e.target.value)} className={input} />
                </div>
                <div>
                  <span className={`mb-1 block text-[11px] font-medium ${muted}`}>{fu.endFrom}</span>
                  <input type="date" value={endDateFrom} onChange={(e) => setEndDateFrom(e.target.value)} className={input} />
                </div>
                <div>
                  <span className={`mb-1 block text-[11px] font-medium ${muted}`}>{fu.endTo}</span>
                  <input type="date" value={endDateTo} onChange={(e) => setEndDateTo(e.target.value)} className={input} />
                </div>
              </div>
            </div>

            <div>
              <p className={`${label} mb-2`}>{fu.fundingTitle}</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder={fu.fundingMin}
                  value={fundingMin}
                  onChange={(e) => setFundingMin(e.target.value)}
                  className={input}
                />
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder={fu.fundingMax}
                  value={fundingMax}
                  onChange={(e) => setFundingMax(e.target.value)}
                  className={input}
                />
              </div>
            </div>

            <div>
              <p className={`${label} mb-2`}>{fu.investmentTitle}</p>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" min={0} inputMode="numeric" placeholder={fu.investmentMin} value={investMin} onChange={(e) => setInvestMin(e.target.value)} className={input} />
                <input type="number" min={0} inputMode="numeric" placeholder={fu.investmentMax} value={investMax} onChange={(e) => setInvestMax(e.target.value)} className={input} />
              </div>
            </div>

            <label className={`flex cursor-pointer items-center gap-2.5 rounded-lg py-0.5 text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
              <input type="checkbox" checked={activeNow} onChange={(e) => setActiveNow(e.target.checked)} className={checkClass} />
              {fu.activeNow}
            </label>
            <label className={`flex cursor-pointer items-center gap-2.5 rounded-lg py-0.5 text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
              <input type="checkbox" checked={funded} onChange={(e) => setFunded(e.target.checked)} className={checkClass} />
              {fu.funded}
            </label>
          </div>
        </details>

        <button
          type="button"
          onClick={resetFilters}
          className={`w-full rounded-xl border py-2.5 text-sm font-semibold transition ${isDark ? "border-white/15 text-zinc-200 hover:border-white/25 hover:bg-white/[0.06]" : "border-zinc-200 text-zinc-700 hover:border-primary-200 hover:bg-primary-50/50 hover:text-primary-900"}`}
        >
          {fu.reset}
        </button>
      </aside>

      <div className="min-w-0 flex-1 space-y-5">
        <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${panelCompact}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${isDark ? "bg-primary-500/15 text-primary-200 ring-1 ring-primary-400/25" : "bg-primary-50 text-primary-900 ring-1 ring-primary-600/15"}`}
            >
              {fu.resultsCount.replace("{count}", String(totalElements))}
            </span>
            {isFetching && campaigns.length > 0 ? (
              <span className={`text-xs font-medium ${muted}`}>…</span>
            ) : null}
          </div>
          <span
            className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${isDark ? "border-white/12 bg-white/[0.05] text-zinc-300" : "border-zinc-200 bg-zinc-100/80 text-zinc-600"}`}
          >
            {fu.sortNewest}
          </span>
        </div>

        {isError ? (
          <div
            className={`rounded-3xl border p-8 text-center shadow-inner ${isDark ? "border-red-500/25 bg-gradient-to-b from-red-950/30 to-red-950/10" : "border-red-200/80 bg-gradient-to-b from-red-50 to-white"}`}
          >
            <p className="text-base font-bold text-red-700 dark:text-red-300">{fu.loadError}</p>
            <p className={`mt-2 text-sm ${muted}`}>{extractApiErrorMessage(error, "")}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-900/20 transition hover:bg-primary-500"
            >
              {fu.retry}
            </button>
          </div>
        ) : null}

        {!isError && (isLoading || isFetching) && campaigns.length === 0 ? (
          <div className={`space-y-4 ${panel}`}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-32 animate-pulse rounded-2xl bg-gradient-to-r ${isDark ? "from-white/[0.07] via-white/[0.04] to-white/[0.07]" : "from-zinc-200 via-zinc-100 to-zinc-200"}`}
              />
            ))}
          </div>
        ) : null}

        {!isError && !isLoading && !isFetching && campaigns.length === 0 ? (
          <div
            className={`rounded-3xl border border-dashed p-10 text-center ${isDark ? "border-white/12 bg-white/[0.02]" : "border-zinc-200 bg-zinc-50/50"}`}
          >
            <p className={`mx-auto max-w-md text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{d.noResults}</p>
          </div>
        ) : null}

        {!isError && campaigns.length > 0 ? (
          <div className="flex flex-col gap-4">
            {campaigns.map((c) => (
              <CampaignListRow
                key={c.id}
                campaign={c}
                locale={locale}
                isDark={isDark}
                fu={fu}
                d={d}
                featured={t.featured}
                muted={muted}
                linkPrimary={linkPrimary}
              />
            ))}
          </div>
        ) : null}

        {!isError && totalElements > PAGE_SIZE ? (
          <div className={`flex flex-wrap items-center justify-between gap-4 ${panelCompact}`}>
            <p className={`text-sm font-medium ${muted}`}>{fu.pageOf.replace("{page}", String(page + 1)).replace("{total}", String(totalPages))}</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${isDark ? "border-white/15 text-zinc-200 hover:bg-white/[0.06]" : "border-zinc-200 text-zinc-700 hover:bg-zinc-100"}`}
              >
                {fu.prev}
              </button>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:opacity-100 dark:disabled:border-white/10 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 ${isDark ? "border-primary-500/40 bg-primary-600 text-white hover:bg-primary-500 enabled:shadow-md enabled:shadow-primary-950/30" : "border-primary-600 bg-primary-600 text-white hover:bg-primary-500 enabled:shadow-md enabled:shadow-primary-900/15"}`}
              >
                {fu.next}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CampaignListRow({
  campaign: c,
  locale,
  isDark,
  fu,
  d,
  featured,
  muted,
  linkPrimary,
}: {
  campaign: MyCampaign;
  locale: Locale;
  isDark: boolean;
  fu: (typeof messages.en.discovery)["filterUi"];
  d: (typeof messages.en.discovery);
  featured: (typeof messages.en.featured);
  muted: string;
  linkPrimary: string;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(c.fundingProgress ?? 0)));
  const days = daysRemaining(c.endDate);
  const companyName = c.company?.name ?? fu.company;

  return (
    <article
      className={`group/card flex flex-col gap-4 rounded-2xl border p-4 transition duration-200 sm:flex-row sm:gap-5 sm:p-5 ${
        isDark
          ? "border-white/[0.08] bg-zinc-900/30 hover:border-primary-500/25 hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-black/20"
          : "border-zinc-200/90 bg-white hover:border-primary-200 hover:shadow-md hover:shadow-primary-900/[0.06]"
      }`}
    >
      <div
        className={`relative h-44 w-full shrink-0 overflow-hidden rounded-2xl ring-1 ring-inset ring-black/5 sm:h-32 sm:w-44 dark:ring-white/10 ${
          isDark ? "bg-zinc-800" : "bg-zinc-100"
        }`}
      >
        {c.heroImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote API host varies
          <img src={c.heroImageUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover/card:scale-[1.03]" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center text-xs ${muted}`}>—</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${muted}`}>
              {fu.posted} {formatDateShort(c.createdAt, locale)}
            </p>
            <Link
              href={`/projects/${c.id}`}
              className={`mt-1 block text-lg font-bold leading-snug transition group-hover/card:text-primary-600 dark:group-hover/card:text-primary-300 sm:text-xl ${isDark ? "text-white" : "text-zinc-900"} `}
            >
              {c.title}
            </Link>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${isDark ? "border-primary-500/35 bg-primary-500/15 text-primary-200" : "border-primary-200 bg-primary-50 text-primary-800"}`}
          >
            {c.status}
          </span>
        </div>

        <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs ${muted}`}>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{companyName}</span>
          <span>
            {fu.raised}: {formatEtb(c.amountRaised ?? 0, locale)} / {formatEtb(c.fundingGoal ?? 0, locale)} ETB
          </span>
          <span>
            {fu.investors}: {c.totalInvestors ?? 0}
          </span>
          <span>
            {fu.ends}: {formatDateShort(c.endDate, locale)} ({days} {featured.daysLeft})
          </span>
        </div>

        <p className={`mt-2 line-clamp-2 text-sm leading-relaxed ${muted}`}>{c.shortDescription}</p>

        {c.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {c.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${isDark ? "border-primary-500/35 bg-primary-950/50 text-primary-200" : "border-primary-200/80 bg-primary-50/90 text-primary-900"}`}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4">
          <div className={`h-2 w-full overflow-hidden rounded-full ${isDark ? "bg-zinc-800" : "bg-zinc-200/90"}`}>
            <div className="h-full rounded-full bg-gradient-to-r from-primary-800 via-primary-600 to-primary-400 shadow-sm shadow-primary-900/20" style={{ width: `${pct}%` }} />
          </div>
          <div className={`mt-2 flex items-center justify-between text-xs ${muted}`}>
            <span className="font-bold text-primary-700 dark:text-primary-300">
              {pct}% {featured.funded}
            </span>
            <Link
              href={`/projects/${c.id}`}
              className={`inline-flex items-center gap-1 text-sm font-bold transition ${linkPrimary}`}
            >
              {d.viewDetails}
              <span aria-hidden className="transition group-hover/card:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
