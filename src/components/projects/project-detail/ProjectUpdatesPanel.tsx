import { useMemo } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import type { Locale, messages } from "@/locales";
import type { CampaignUpdate } from "@/store";
import { useGetCampaignUpdatesQuery } from "@/store";
import { projectDetailCardClass, projectDetailMutedClass } from "./projectDetailClassNames";

type UpdatesCopy = (typeof messages)["en"]["projectDetail"]["updates"];

function sortUpdates(list: CampaignUpdate[]): CampaignUpdate[] {
  return [...list].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    const ta = new Date(a.postedAt).getTime();
    const tb = new Date(b.postedAt).getTime();
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
  });
}

function formatPostedAt(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(locale === "am" ? "am-ET" : "en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function contentEntries(u: CampaignUpdate): [string, string][] {
  return u.content && typeof u.content === "object" ? Object.entries(u.content as Record<string, string>) : [];
}

type ProjectUpdatesPanelProps = {
  campaignId: number;
  locale: Locale;
  isDark: boolean;
  t: UpdatesCopy;
};

type UpdatesRefreshBarProps = {
  muted: string;
  card: string;
  t: UpdatesCopy;
  isRefreshing: boolean;
  isDark: boolean;
  onRefresh: () => void;
};

function UpdatesRefreshBar({ muted, card, t, isRefreshing, isDark, onRefresh }: UpdatesRefreshBarProps) {
  return (
    <div className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 sm:px-5 ${card}`}>
      <p className={`text-sm ${muted}`}>{t.refreshHint}</p>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        aria-label={t.refreshLabel}
        className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          isDark ? "border-white/15 text-zinc-100 hover:bg-white/10" : "border-zinc-300 text-zinc-800 hover:bg-zinc-100"
        }`}
      >
        {isRefreshing ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="h-4 w-4" aria-hidden />
        )}
        <span className="sr-only sm:not-sr-only">{t.refreshLabel}</span>
      </button>
    </div>
  );
}

export function ProjectUpdatesPanel({ campaignId, locale, isDark, t }: ProjectUpdatesPanelProps) {
  const listQuery = useGetCampaignUpdatesQuery(campaignId);
  const sorted = useMemo(() => sortUpdates(listQuery.data ?? []), [listQuery.data]);

  const card = projectDetailCardClass(isDark);
  const muted = projectDetailMutedClass(isDark);
  const isInitialLoad = listQuery.isLoading && !listQuery.data;
  const isRefreshing = listQuery.isFetching && !isInitialLoad;

  function refreshSection() {
    void listQuery.refetch();
  }

  const refreshBar = (
    <UpdatesRefreshBar muted={muted} card={card} t={t} isRefreshing={isRefreshing} isDark={isDark} onRefresh={refreshSection} />
  );

  if (isInitialLoad) {
    return (
      <div className="mt-8">
        {refreshBar}
        <ul className="space-y-5 animate-pulse" aria-busy="true">
          <li className={`h-28 rounded-2xl ${isDark ? "bg-zinc-800/80" : "bg-zinc-200"}`} />
          <li className={`h-28 rounded-2xl ${isDark ? "bg-zinc-800/80" : "bg-zinc-200"}`} />
        </ul>
      </div>
    );
  }

  if (listQuery.isError) {
    return (
      <div className="mt-8">
        {refreshBar}
        <div className={`rounded-2xl border p-5 sm:p-6 ${card} ${isDark ? "border-red-500/30 bg-red-500/5" : "border-red-200 bg-red-50"}`}>
          <p className={`text-sm ${isDark ? "text-red-200" : "text-red-800"}`}>{extractApiErrorMessage(listQuery.error, t.loadFailed)}</p>
          <button
            type="button"
            onClick={refreshSection}
            className={`mt-3 text-sm font-semibold underline ${isDark ? "text-primary-300" : "text-primary-700"}`}
          >
            {t.retry}
          </button>
        </div>
        </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="mt-8">
        {refreshBar}
        <p className={`rounded-2xl border border-dashed px-4 py-10 text-center text-sm ${muted} ${card} ${isRefreshing ? "opacity-60" : ""}`}>
          {t.emptyList}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {refreshBar}
      <ul className={`space-y-5 transition-opacity ${isRefreshing ? "pointer-events-none opacity-60" : ""}`} aria-busy={isRefreshing}>
        {sorted.map((u) => {
          const entries = contentEntries(u);
          return (
            <li
              key={u.id}
              className={`rounded-2xl border p-5 sm:p-6 ${card} ${
                u.isPinned
                  ? isDark
                    ? "border-primary-500/40 bg-gradient-to-br from-primary-950/40 to-zinc-900/60"
                    : "border-primary-200 bg-gradient-to-br from-primary-50/80 to-white"
                  : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-widest text-primary-500">{formatPostedAt(u.postedAt, locale)}</p>
                {u.isPinned ? (
                  <span className="rounded-full bg-primary-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{t.pinnedBadge}</span>
                ) : null}
              </div>
              <h3 className={`mt-2 text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>{u.title}</h3>
              {entries.length > 0 ? (
                <dl className={`mt-4 space-y-3 border-t pt-4 ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                  {entries.map(([k, v]) => (
                    <div key={k}>
                      <dt className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>{k}</dt>
                      <dd className={`mt-1 text-base leading-relaxed ${muted}`}>{v}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className={`mt-3 text-base italic leading-relaxed ${muted}`}>{t.noContentBody}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
