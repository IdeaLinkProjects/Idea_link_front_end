import Link from "next/link";
import { useRouter } from "next/router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { IdealLinkLogo } from "@/components/brand/IdealLinkLogo";
import { NotificationsMenu } from "@/components/dashboard/NotificationsMenu";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { clearAuthTokens } from "@/lib/auth/tokenStorage";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { messages } from "@/locales";
import { useGetUserRolesStatusQuery } from "@/store";

const MESSAGE_BADGE = 3;

type DashboardLayoutProps = {
  children: ReactNode;
};

function initialsFromFullName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0];
    const b = parts[parts.length - 1][0];
    if (a && b) return (a + b).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return parts[0]?.[0]?.toUpperCase() ?? "?";
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { data: userRolesStatus } = useGetUserRolesStatusQuery();

  const t = messages[locale].commonDashboard;

  const nav: Array<{
    href: string;
    label: string;
    match: (p: string) => boolean;
    badge?: number;
  }> = [
    { href: "/dashboard", label: t.navDashboard, match: (p) => p === "/dashboard" },
    {
      href: "/dashboard/projects",
      label: t.navProjects,
      match: (p) => p.startsWith("/dashboard/projects") || p.startsWith("/dashboard/campaigns"),
    },
    { href: "/dashboard/company", label: t.navCompany, match: (p) => p.startsWith("/dashboard/company") },
    { href: "/dashboard/payment", label: t.navPayment, match: (p) => p.startsWith("/dashboard/payment") },
    {
      href: "/dashboard/messages",
      label: t.navMessages,
      match: (p) => p.startsWith("/dashboard/messages"),
      badge: MESSAGE_BADGE,
    },
  ];

  const pageBg = isDark
    ? "bg-gradient-to-br from-zinc-950 via-emerald-950/25 to-zinc-900 text-zinc-100"
    : "bg-slate-100 text-slate-900";
  const topBar = isDark ? "border-white/10 bg-zinc-950/90 backdrop-blur-xl" : "border-slate-200/90 bg-white/85 shadow-sm backdrop-blur-xl";
  const sidebarBg = isDark ? "border-white/10 bg-zinc-950/95" : "border-slate-200/90 bg-white/90 shadow-sm";
  const navInactive = isDark
    ? "text-zinc-400 hover:bg-white/10 hover:text-white"
    : "text-black hover:bg-primary-100 hover:text-black";
  const navActive = isDark ? "bg-primary-900/40 text-primary-300" : "bg-primary-100 text-primary-900 shadow-sm";

  const avatarInitials = userRolesStatus?.fullName?.trim()
    ? initialsFromFullName(userRolesStatus.fullName)
    : t.userFirstName.trim().slice(0, 2).toUpperCase() || "?";

  useEffect(() => {
    if (!profileMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const el = profileMenuRef.current;
      if (el && !el.contains(e.target as Node)) setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [profileMenuOpen]);

  return (
    <RequireAuth>
      <div className={`relative min-h-screen ${pageBg}`}>
        {mobileNavOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            aria-label={t.closeMenu}
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-200 lg:translate-x-0 ${sidebarBg} ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className={`flex h-16 shrink-0 items-center justify-between border-b px-4 ${isDark ? "border-white/10" : "border-zinc-200"}`}>
            <IdealLinkLogo
              className="inline-flex items-center transition hover:opacity-90"
              width={128}
              height={36}
              imageClassName="h-9 w-auto"
              onClick={() => setMobileNavOpen(false)}
            />
            <button
              type="button"
              className={`rounded-lg p-2 lg:hidden ${isDark ? "hover:bg-white/10" : "hover:bg-zinc-100"}`}
              onClick={() => setMobileNavOpen(false)}
              aria-label={t.closeMenu}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="flex flex-col gap-1">
              {nav.map((item) => {
                const active = item.match(router.pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? navActive : navInactive}`}
                  >
                    <span>{item.label}</span>
                    {item.badge != null ? (
                      <span className="rounded-full bg-primary-950 px-2 py-0.5 text-xs font-bold text-white">{item.badge}</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </nav>
          <div
            className={`shrink-0 border-t p-3 ${isDark ? "border-white/10 bg-zinc-950/80" : "border-slate-200 bg-white/90"}`}
          >
            <button
              type="button"
              onClick={() => {
                clearAuthTokens();
                void router.push("/login");
              }}
              className="w-full rounded-xl border px-3 py-2.5 text-sm font-semibold transition hover:opacity-90 dark:border-white/15 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10 border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
            >
              {t.logout}
            </button>
          </div>
        </aside>

        <div className="lg:pl-64">
          <header
            className={`sticky top-0 z-30 flex h-16 min-h-16 items-center gap-2 border-b px-3 sm:px-4 ${topBar}`}
          >
            <button
              type="button"
              className={`shrink-0 rounded-lg p-2 lg:hidden ${isDark ? "hover:bg-white/10" : "hover:bg-zinc-100"}`}
              onClick={() => setMobileNavOpen(true)}
              aria-label={t.openMenu}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="relative min-w-0 flex-1">
              <div className="relative w-1/2 min-w-0">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400" aria-hidden>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  type="search"
                  name="dashboard-search"
                  placeholder={t.navSearchPlaceholder}
                  className={`w-full rounded-xl border py-2 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-primary-500/30 ${
                    isDark
                      ? "border-white/10 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
                      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-500"
                  }`}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <NotificationsMenu />

              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((o) => !o)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2 transition ${
                    isDark
                      ? "bg-primary-900/50 text-primary-200 ring-white/10 hover:bg-primary-900/70"
                      : "bg-primary-100 text-primary-900 ring-slate-300 hover:bg-primary-200"
                  }`}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                  aria-label={t.navProfileMenu}
                >
                  {avatarInitials}
                </button>
                {profileMenuOpen ? (
                  <div
                    role="menu"
                    className={`absolute right-0 top-full z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border py-1 shadow-lg ${
                      isDark ? "border-white/10 bg-zinc-900" : "border-slate-200 bg-white shadow-lg shadow-slate-200/60"
                    }`}
                  >
                    <Link
                      href="/dashboard/profile"
                      role="menuitem"
                      className={`block px-4 py-2.5 text-sm font-medium ${isDark ? "text-zinc-100 hover:bg-white/10" : "text-slate-800 hover:bg-slate-50"}`}
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      {t.navProfileDropdown}
                    </Link>
                    <div className={isDark ? "border-t border-white/10" : "border-t border-slate-200"} role="none" />
                    <Link
                      href="/dashboard/settings"
                      role="menuitem"
                      className={`block px-4 py-2.5 text-sm font-medium ${isDark ? "text-zinc-100 hover:bg-white/10" : "text-slate-800 hover:bg-slate-50"}`}
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      {t.navSettings}
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </header>
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
