import Link from "next/link";
import { useRouter } from "next/router";
import { Bell, ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages, type Locale } from "@/locales";
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/store/api/notificationsApi";
import type { UserNotification } from "@/store/api/notificationsApi";
import { useEffect, useRef, useState } from "react";
import { getNotificationVisual, resolveNotificationKind } from "./notificationPresentation";

const PAGE_SIZE = 10;

type MenuStrings = (typeof messages)["en"]["commonDashboard"]["notificationsMenu"];

function formatNotificationTime(iso: string, locale: Locale, s: MenuStrings): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return s.justNow;
  if (mins < 60) return s.minutesAgo.replace("{n}", String(mins));
  const hours = Math.floor(mins / 60);
  if (hours < 24) return s.hoursAgo.replace("{n}", String(hours));
  if (hours < 48) return s.yesterday;
  const loc = locale === "am" ? "am-ET" : "en-GB";
  try {
    return new Intl.DateTimeFormat(loc, { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

export function NotificationsMenu() {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].commonDashboard;
  const nm = t.notificationsMenu;

  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const prevOpen = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useGetUnreadNotificationCountQuery();
  const unread = unreadData?.count ?? 0;

  const {
    data: pageData,
    isFetching,
    isError,
    refetch,
  } = useGetNotificationsQuery({ page, size: PAGE_SIZE }, { skip: !open });

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();
  const [removeNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();

  useEffect(() => {
    if (open && !prevOpen.current) setPage(0);
    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const canPrev = !!pageData && !pageData.first;
  const canNext = !!pageData && !pageData.last;
  const pageLabel =
    pageData && pageData.totalPages > 0
      ? nm.pageOf
          .replace("{current}", String((pageData.number ?? 0) + 1))
          .replace("{total}", String(pageData.totalPages))
      : "";
  const showPagination = !!pageData && !pageData.empty && pageData.totalPages > 1;

  const panelBorder = isDark ? "border-white/10 bg-zinc-900/95 shadow-xl shadow-black/40" : "border-slate-200/90 bg-white shadow-xl shadow-slate-300/30";
  const muted = isDark ? "text-zinc-500" : "text-slate-500";
  const rowHover = isDark ? "hover:bg-white/[0.06]" : "hover:bg-slate-50";
  const unreadBg = isDark ? "bg-primary-950/25" : "bg-primary-50/80";

  const onRowActivate = async (n: UserNotification) => {
    if (!n.read) {
      try {
        await markRead(n.id).unwrap();
      } catch {
        /* keep UI stable */
      }
    }
    const url = n.actionUrl?.trim();
    if (!url) return;
    if (/^https?:\/\//i.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    const path = url.startsWith("/") ? url : `/${url}`;
    void router.push(path);
    setOpen(false);
  };

  const badge =
    unread > 0 ? (
      <span
        className={`absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full px-1 text-[0.65rem] font-bold leading-none text-white ring-2 ${
          isDark ? "bg-rose-500 ring-zinc-950" : "bg-rose-500 ring-white"
        }`}
        aria-hidden
      >
        {unread > 99 ? "99+" : unread}
      </span>
    ) : null;

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative rounded-full p-2 transition ${isDark ? "text-zinc-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread > 0 ? `${t.navNotifications} (${nm.unreadCountAria.replace("{n}", String(unread))})` : t.navNotifications}
      >
        <Bell className="h-6 w-6" strokeWidth={2} aria-hidden />
        {badge}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={nm.title}
          className={`absolute right-0 top-full z-[60] mt-2 flex w-[min(100vw-1.25rem,22rem)] flex-col overflow-hidden rounded-2xl border sm:w-96 ${panelBorder}`}
        >
          <div
            className={`flex items-start justify-between gap-2 border-b px-4 py-3 ${isDark ? "border-white/10 bg-zinc-900/80" : "border-slate-100 bg-slate-50/90"}`}
          >
            <div>
              <p className={`text-sm font-bold ${isDark ? "text-zinc-100" : "text-slate-900"}`}>{nm.title}</p>
              {unread > 0 ? (
                <p className={`mt-0.5 text-xs font-medium ${muted}`}>
                  {nm.unreadSummary.replace("{n}", String(unread))}
                </p>
              ) : (
                <p className={`mt-0.5 text-xs ${muted}`}>{nm.allCaughtUp}</p>
              )}
            </div>
            <button
              type="button"
              disabled={unread === 0 || markingAll}
              onClick={() => {
                void markAllRead().unwrap().catch(() => undefined);
              }}
              className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                isDark
                  ? "bg-white/10 text-primary-200 hover:bg-white/15"
                  : "bg-primary-600 text-white hover:bg-primary-700"
              }`}
            >
              {markingAll ? nm.markingAll : nm.markAllRead}
            </button>
          </div>

          <div
            className={`relative max-h-[min(70vh,22rem)] overflow-y-auto overscroll-contain ${isDark ? "bg-zinc-950/40" : "bg-white"}`}
          >
            {isFetching && pageData ? (
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 ${isDark ? "bg-white/10" : "bg-slate-200"}`}
                aria-hidden
              >
                <div className={`h-full w-full animate-pulse ${isDark ? "bg-primary-400/90" : "bg-primary-500/80"}`} />
              </div>
            ) : null}

            {isFetching && !pageData ? (
              <div className={`flex items-center justify-center gap-2 py-12 text-sm ${muted}`}>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                {nm.loading}
              </div>
            ) : null}

            {isError ? (
              <div className="px-4 py-8 text-center">
                <p className={`text-sm font-medium ${isDark ? "text-red-300" : "text-red-600"}`}>{nm.loadError}</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className={`mt-3 text-sm font-semibold underline-offset-2 hover:underline ${isDark ? "text-primary-300" : "text-primary-700"}`}
                >
                  {nm.retry}
                </button>
              </div>
            ) : null}

            {!isError && pageData?.empty && !isFetching ? (
              <div className={`px-4 py-12 text-center text-sm ${muted}`}>{nm.empty}</div>
            ) : null}

            {!isError && pageData && !pageData.empty ? (
              <ul className="divide-y divide-dashed py-1" role="list">
                {pageData.content.map((n) => {
                  const kind = resolveNotificationKind(n.type);
                  const { Icon, wrap } = getNotificationVisual(kind, isDark);
                  const timeLabel = formatNotificationTime(n.createdAt, locale, nm);

                  return (
                    <li key={n.id}>
                      <div
                        className={`flex gap-3 px-3 py-2.5 transition ${rowHover} ${!n.read ? unreadBg : ""}`}
                      >
                        <div
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${wrap}`}
                          aria-hidden
                        >
                          <Icon className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            className="w-full text-left"
                            onClick={() => void onRowActivate(n)}
                          >
                            <p
                              className={`text-sm font-semibold leading-snug ${!n.read ? (isDark ? "text-zinc-50" : "text-slate-900") : isDark ? "text-zinc-300" : "text-slate-700"}`}
                            >
                              {n.title}
                            </p>
                            {n.message ? (
                              <p className={`mt-0.5 line-clamp-2 text-xs leading-relaxed ${muted}`}>{n.message}</p>
                            ) : null}
                            <p className={`mt-1 text-[0.7rem] font-medium uppercase tracking-wide ${muted}`}>
                              {timeLabel}
                              {n.actionUrl ? ` · ${nm.openAction}` : ""}
                            </p>
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={(e) => {
                            e.stopPropagation();
                            void removeNotification(n.id).unwrap().catch(() => undefined);
                          }}
                          className={`mt-1 self-start rounded-lg p-1.5 transition ${isDark ? "text-zinc-500 hover:bg-white/10 hover:text-red-300" : "text-slate-400 hover:bg-red-50 hover:text-red-600"}`}
                          aria-label={nm.deleteAria}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          {showPagination ? (
            <div
              className={`flex items-center justify-between gap-2 border-t px-3 py-2.5 ${isDark ? "border-white/10 bg-zinc-900/90" : "border-slate-100 bg-slate-50/90"}`}
            >
              <button
                type="button"
                disabled={!canPrev || isFetching}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition disabled:opacity-35 ${
                  isDark ? "text-zinc-200 hover:bg-white/10" : "text-slate-700 hover:bg-slate-200/60"
                }`}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                {nm.prev}
              </button>
              <span className={`min-w-0 flex-1 text-center text-xs font-medium ${muted}`}>{pageLabel}</span>
              <button
                type="button"
                disabled={!canNext || isFetching}
                onClick={() => setPage((p) => p + 1)}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition disabled:opacity-35 ${
                  isDark ? "text-zinc-200 hover:bg-white/10" : "text-slate-700 hover:bg-slate-200/60"
                }`}
              >
                {nm.next}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : null}

          <div className={`border-t px-3 py-2 text-center ${isDark ? "border-white/10 bg-zinc-950/60" : "border-slate-100 bg-slate-50/80"}`}>
            <Link
              href="/dashboard/settings"
              className={`text-xs font-semibold ${isDark ? "text-primary-300 hover:text-primary-200" : "text-primary-700 hover:text-primary-800"}`}
              onClick={() => setOpen(false)}
            >
              {nm.manageInSettings}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
