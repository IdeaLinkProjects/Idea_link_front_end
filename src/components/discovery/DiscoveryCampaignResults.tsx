import Link from "next/link";
import { Bookmark } from "lucide-react";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import type { Locale } from "@/locales";
import type { messages } from "@/locales";
import type { MyCampaign } from "@/store";
import { DISCOVERY_PAGE_SIZE } from "./constants";
import { CampaignListRow } from "./CampaignListRow";
import type { DiscoveryCopy, DiscoveryFilterUi, DiscoveryView, SaveCampaignLabels } from "./types";
import type { DiscoveryTheme } from "./discoveryTheme";

type DiscoveryCampaignResultsProps = {
  view: DiscoveryView;
  isSavedView: boolean;
  isLoggedIn: boolean;
  campaigns: MyCampaign[];
  totalElements: number;
  totalPages: number;
  page: number;
  onPageChange: (updater: (page: number) => number) => void;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  locale: Locale;
  isDark: boolean;
  copy: DiscoveryCopy;
  filterUi: DiscoveryFilterUi;
  featured: (typeof messages.en.featured);
  saveLabels: SaveCampaignLabels;
  theme: DiscoveryTheme;
};

export function DiscoveryCampaignResults({
  view,
  isSavedView,
  isLoggedIn,
  campaigns,
  totalElements,
  totalPages,
  page,
  onPageChange,
  isLoading,
  isFetching,
  isError,
  error,
  onRetry,
  locale,
  isDark,
  copy,
  filterUi: fu,
  featured,
  saveLabels,
  theme,
}: DiscoveryCampaignResultsProps) {
  const { panel, panelCompact, muted, linkPrimary } = theme;
  const showResults = !isSavedView || isLoggedIn;

  return (
    <div className="min-w-0 flex-1 space-y-5">
      <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${panelCompact}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${isDark ? "bg-primary-500/15 text-primary-200 ring-1 ring-primary-400/25" : "bg-primary-50 text-primary-900 ring-1 ring-primary-600/15"}`}
          >
            {fu.resultsCount.replace("{count}", String(totalElements))}
          </span>
          {isFetching && campaigns.length > 0 ? <span className={`text-xs font-medium ${muted}`}>…</span> : null}
        </div>
        {view === "all" ? (
          <span
            className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${isDark ? "border-white/12 bg-white/[0.05] text-zinc-300" : "border-zinc-200 bg-zinc-100/80 text-zinc-600"}`}
          >
            {fu.sortNewest}
          </span>
        ) : null}
      </div>

      {isSavedView && !isLoggedIn ? <SavedLoginPrompt filterUi={fu} isDark={isDark} /> : null}

      {isError ? <LoadError filterUi={fu} error={error} mutedClass={muted} onRetry={onRetry} isDark={isDark} /> : null}

      {!isError && showResults && (isLoading || isFetching) && campaigns.length === 0 ? (
        <LoadingSkeleton panelClass={panel} isDark={isDark} />
      ) : null}

      {!isError && showResults && !isLoading && !isFetching && campaigns.length === 0 ? (
        <EmptyState isSavedView={isSavedView} copy={copy} filterUi={fu} isDark={isDark} />
      ) : null}

      {!isError && campaigns.length > 0 ? (
        <div className="flex flex-col gap-4">
          {campaigns.map((campaign) => (
            <CampaignListRow
              key={campaign.id}
              campaign={campaign}
              locale={locale}
              isDark={isDark}
              filterUi={fu}
              copy={copy}
              featured={featured}
              muted={muted}
              linkPrimary={linkPrimary}
              saveLabels={saveLabels}
            />
          ))}
        </div>
      ) : null}

      {!isError && totalElements > DISCOVERY_PAGE_SIZE ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          filterUi={fu}
          panelClass={panelCompact}
          mutedClass={muted}
          isDark={isDark}
          onPageChange={onPageChange}
        />
      ) : null}
    </div>
  );
}

function SavedLoginPrompt({ filterUi: fu, isDark }: { filterUi: DiscoveryFilterUi; isDark: boolean }) {
  return (
    <div
      className={`rounded-3xl border border-dashed p-10 text-center ${isDark ? "border-white/12 bg-white/[0.02]" : "border-zinc-200 bg-zinc-50/50"}`}
    >
      <Bookmark className={`mx-auto h-10 w-10 ${isDark ? "text-primary-400" : "text-primary-600"}`} aria-hidden />
      <p className={`mx-auto mt-4 max-w-md text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
        {fu.savedLoginPrompt}
      </p>
      <Link
        href="/login"
        className="mt-5 inline-flex rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-900/20 transition hover:bg-primary-500"
      >
        {fu.signIn}
      </Link>
    </div>
  );
}

function LoadError({
  filterUi: fu,
  error,
  mutedClass,
  onRetry,
  isDark,
}: {
  filterUi: DiscoveryFilterUi;
  error: unknown;
  mutedClass: string;
  onRetry: () => void;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-8 text-center shadow-inner ${isDark ? "border-red-500/25 bg-gradient-to-b from-red-950/30 to-red-950/10" : "border-red-200/80 bg-gradient-to-b from-red-50 to-white"}`}
    >
      <p className="text-base font-bold text-red-700 dark:text-red-300">{fu.loadError}</p>
      <p className={`mt-2 text-sm ${mutedClass}`}>{extractApiErrorMessage(error, "")}</p>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="mt-5 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-900/20 transition hover:bg-primary-500"
      >
        {fu.retry}
      </button>
    </div>
  );
}

function LoadingSkeleton({ panelClass, isDark }: { panelClass: string; isDark: boolean }) {
  return (
    <div className={`space-y-4 ${panelClass}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`h-32 animate-pulse rounded-2xl bg-gradient-to-r ${isDark ? "from-white/[0.07] via-white/[0.04] to-white/[0.07]" : "from-zinc-200 via-zinc-100 to-zinc-200"}`}
        />
      ))}
    </div>
  );
}

function EmptyState({
  isSavedView,
  copy,
  filterUi: fu,
  isDark,
}: {
  isSavedView: boolean;
  copy: DiscoveryCopy;
  filterUi: DiscoveryFilterUi;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border border-dashed p-10 text-center ${isDark ? "border-white/12 bg-white/[0.02]" : "border-zinc-200 bg-zinc-50/50"}`}
    >
      {isSavedView ? (
        <Bookmark className={`mx-auto h-10 w-10 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} aria-hidden />
      ) : null}
      <p className={`mx-auto max-w-md text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
        {isSavedView ? fu.savedEmpty : copy.noResults}
      </p>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  filterUi: fu,
  panelClass,
  mutedClass,
  isDark,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  filterUi: DiscoveryFilterUi;
  panelClass: string;
  mutedClass: string;
  isDark: boolean;
  onPageChange: (updater: (page: number) => number) => void;
}) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 ${panelClass}`}>
      <p className={`text-sm font-medium ${mutedClass}`}>
        {fu.pageOf.replace("{page}", String(page + 1)).replace("{total}", String(totalPages))}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onPageChange((p) => Math.max(0, p - 1))}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${isDark ? "border-white/15 text-zinc-200 hover:bg-white/[0.06]" : "border-zinc-200 text-zinc-700 hover:bg-zinc-100"}`}
        >
          {fu.prev}
        </button>
        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange((p) => p + 1)}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:opacity-100 dark:disabled:border-white/10 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 ${isDark ? "border-primary-500/40 bg-primary-600 text-white hover:bg-primary-500 enabled:shadow-md enabled:shadow-primary-950/30" : "border-primary-600 bg-primary-600 text-white hover:bg-primary-500 enabled:shadow-md enabled:shadow-primary-900/15"}`}
        >
          {fu.next}
        </button>
      </div>
    </div>
  );
}
