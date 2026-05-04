import Link from "next/link";
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

export function HomeDiscoverySection() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale];
  const d = t.discovery;
  const fu = d.filterUi;

  const [keyword, setKeyword] = useState("");
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
    setPage(0);
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
    ? "rounded-2xl border border-white/15 bg-white/[0.04] p-4 shadow-sm"
    : "rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm";
  const label = isDark ? "text-xs font-semibold uppercase tracking-wide text-zinc-400" : "text-xs font-semibold uppercase tracking-wide text-zinc-500";
  const input =
    "w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-600/40 " +
    (isDark ? "border-white/20 bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500" : "border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400");
  const muted = isDark ? "text-zinc-400" : "text-zinc-600";
  const linkPrimary = isDark ? "text-primary-300 hover:text-primary-200" : "text-primary-700 hover:text-primary-800";

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <aside className={`w-full shrink-0 space-y-4 lg:sticky lg:top-24 lg:w-80 ${panel}`}>
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
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-xs font-medium ${muted} hover:bg-black/10 dark:hover:bg-white/10`}
                aria-label={fu.clearKeyword}
              >
                ×
              </button>
            ) : null}
          </div>
        </div>

        <details className="group" open>
          <summary className={`cursor-pointer list-none text-sm font-semibold [&::-webkit-details-marker]:hidden ${linkPrimary}`}>
            {fu.advancedSearch}
          </summary>
          <div className="mt-4 space-y-5 border-t border-dashed pt-4 dark:border-white/10">
            <div>
              <p className={`${label} mb-2`}>{fu.statusTitle}</p>
              <div className="flex flex-col gap-1.5">
                {CAMPAIGN_FILTER_STATUS_OPTIONS.map((s) => (
                  <label key={s} className={`flex cursor-pointer items-center gap-2 text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                    <input type="checkbox" checked={statuses.includes(s)} onChange={() => toggleStatus(s)} className="rounded border-zinc-400" />
                    <span>{fu.statusLabels[s]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className={`${label} mb-2`}>{fu.tagsTitle}</p>
              <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                {tagsQuery.isLoading ? (
                  <p className={`text-sm ${muted}`}>…</p>
                ) : tagsQuery.data?.length ? (
                  tagsQuery.data.map((tag) => (
                    <label
                      key={tag.id}
                      className={`flex cursor-pointer items-center justify-between gap-2 text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <input type="checkbox" checked={tagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} className="rounded border-zinc-400" />
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

            <label className={`flex cursor-pointer items-center gap-2 text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
              <input type="checkbox" checked={activeNow} onChange={(e) => setActiveNow(e.target.checked)} className="rounded border-zinc-400" />
              {fu.activeNow}
            </label>
            <label className={`flex cursor-pointer items-center gap-2 text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
              <input type="checkbox" checked={funded} onChange={(e) => setFunded(e.target.checked)} className="rounded border-zinc-400" />
              {fu.funded}
            </label>
          </div>
        </details>

        <button type="button" onClick={resetFilters} className={`w-full rounded-lg border py-2 text-sm font-semibold transition ${isDark ? "border-white/20 hover:bg-white/10" : "border-zinc-300 hover:bg-zinc-50"}`}>
          {fu.reset}
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <div className={`mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${panel}`}>
          <p className={`text-sm font-medium ${muted}`}>{fu.resultsCount.replace("{count}", String(totalElements))}</p>
          <span className={`rounded-md border px-2 py-1 text-xs font-medium ${isDark ? "border-white/15 bg-white/5" : "border-zinc-200 bg-zinc-50"}`}>{fu.sortNewest}</span>
        </div>

        {isError ? (
          <div className={`rounded-2xl border p-6 text-center ${isDark ? "border-red-500/30 bg-red-950/20" : "border-red-200 bg-red-50"}`}>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">{fu.loadError}</p>
            <p className={`mt-1 text-xs ${muted}`}>{extractApiErrorMessage(error, "")}</p>
            <button type="button" onClick={() => void refetch()} className="mt-3 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500">
              {fu.retry}
            </button>
          </div>
        ) : null}

        {!isError && (isLoading || isFetching) && campaigns.length === 0 ? (
          <div className={`space-y-4 ${panel}`}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-28 animate-pulse rounded-xl ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />
            ))}
          </div>
        ) : null}

        {!isError && !isLoading && !isFetching && campaigns.length === 0 ? (
          <p className={`rounded-2xl border p-8 text-center text-sm ${isDark ? "border-white/15 bg-white/5 text-zinc-300" : "border-zinc-200 bg-white text-zinc-600"}`}>{d.noResults}</p>
        ) : null}

        {!isError && campaigns.length > 0 ? (
          <div className={`divide-y overflow-hidden rounded-2xl border ${isDark ? "divide-white/10 border-white/15 bg-white/[0.03]" : "divide-zinc-200 border-zinc-200 bg-white"}`}>
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
          <div className={`mt-6 flex flex-wrap items-center justify-between gap-3 ${panel}`}>
            <p className={`text-sm ${muted}`}>{fu.pageOf.replace("{page}", String(page + 1)).replace("{total}", String(totalPages))}</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className={`rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-40 ${isDark ? "border-white/20 hover:bg-white/10" : "border-zinc-300 hover:bg-zinc-50"}`}
              >
                {fu.prev}
              </button>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-40 ${isDark ? "border-white/20 hover:bg-white/10" : "border-zinc-300 hover:bg-zinc-50"}`}
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
    <article className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 sm:p-5">
      <div className={`relative h-40 w-full shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-40 ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}>
        {c.heroImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote API host varies
          <img src={c.heroImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center text-xs ${muted}`}>—</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className={`text-xs ${muted}`}>
              {fu.posted} {formatDateShort(c.createdAt, locale)}
            </p>
            <Link href={`/projects/${c.id}`} className={`mt-1 block text-lg font-bold leading-snug hover:underline ${isDark ? "text-white" : "text-zinc-900"}`}>
              {c.title}
            </Link>
          </div>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${isDark ? "border-white/15 bg-white/10 text-zinc-200" : "border-zinc-200 bg-zinc-100 text-zinc-700"}`}>{c.status}</span>
        </div>

        <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs ${muted}`}>
          <span>{companyName}</span>
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
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${isDark ? "border-primary-500/40 bg-primary-950/40 text-primary-200" : "border-primary-200 bg-primary-50 text-primary-900"}`}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4">
          <div className={`h-2 w-full overflow-hidden rounded-full ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`}>
            <div className="h-full rounded-full bg-gradient-to-r from-primary-950 to-primary-600" style={{ width: `${pct}%` }} />
          </div>
          <div className={`mt-1.5 flex items-center justify-between text-xs ${muted}`}>
            <span className="font-semibold text-primary-700 dark:text-primary-300">
              {pct}% {featured.funded}
            </span>
            <Link href={`/projects/${c.id}`} className={`text-sm font-semibold ${linkPrimary}`}>
              {d.viewDetails} →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
