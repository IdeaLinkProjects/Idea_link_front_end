import Link from "next/link";
import { useRouter } from "next/router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { clearAuthTokens } from "@/lib/auth/tokenStorage";
import { type ReactNode, useState } from "react";
import { messages } from "@/locales";

const MESSAGE_BADGE = 2;

type InvestorLayoutProps = {
  children: ReactNode;
};

export function InvestorLayout({ children }: InvestorLayoutProps) {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const t = messages[locale].investorDashboard;

  const nav: Array<{
    href: string;
    label: string;
    match: (p: string) => boolean;
    badge?: number;
  }> = [
    { href: "/investor", label: t.navDashboard, match: (p) => p === "/investor" },
    { href: "/discovery", label: t.navBrowse, match: (p) => p === "/discovery" },
    { href: "/investor/portfolio", label: t.navPortfolio, match: (p) => p.startsWith("/investor/portfolio") },
    {
      href: "/investor/messages",
      label: t.navMessages,
      match: (p) => p.startsWith("/investor/messages"),
      badge: MESSAGE_BADGE,
    },
    { href: "/investor/profile", label: t.navProfile, match: (p) => p.startsWith("/investor/profile") },
  ];

  const pageBg = isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900";
  const topBar = isDark ? "border-white/10 bg-zinc-950/90 backdrop-blur-xl" : "border-zinc-200 bg-white/90 backdrop-blur-xl";
  const sidebarBg = isDark ? "border-white/10 bg-zinc-950/95" : "border-zinc-200 bg-white";
  const navInactive = isDark
    ? "text-zinc-400 hover:bg-white/10 hover:text-white"
    : "text-zinc-600 hover:bg-emerald-50 hover:text-zinc-900";
  const navActive = isDark ? "bg-emerald-900/40 text-emerald-300" : "bg-emerald-100 text-emerald-900";

  const userDisplay = `${t.userFirstName} ${t.userRoleSuffix}`;

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
        <div className={`flex h-16 items-center justify-between border-b px-4 ${isDark ? "border-white/10" : "border-zinc-200"}`}>
          <Link href="/" className="text-lg font-extrabold tracking-tight" onClick={() => setMobileNavOpen(false)}>
            <span className="text-emerald-500">Ideal</span>
            <span className="text-emerald-400">Link</span>
          </Link>
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
        <nav className="flex flex-1 flex-col gap-1 p-3">
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
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">{item.badge}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className={`sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 ${topBar}`}>
          <button
            type="button"
            className={`rounded-lg p-2 lg:hidden ${isDark ? "hover:bg-white/10" : "hover:bg-zinc-100"}`}
            onClick={() => setMobileNavOpen(true)}
            aria-label={t.openMenu}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="text-lg font-extrabold tracking-tight lg:hidden">
            <span className="text-emerald-500">Ideal</span>
            <span className="text-emerald-400">Link</span>
          </Link>
          <Link href="/" className="ml-2 hidden text-lg font-extrabold tracking-tight lg:inline-flex">
            <span className="text-emerald-500">Ideal</span>
            <span className="text-emerald-400">Link</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <span
              className={`max-w-[12rem] truncate text-sm font-semibold sm:max-w-none ${isDark ? "text-zinc-200" : "text-zinc-800"}`}
              title={userDisplay}
            >
              {userDisplay}
            </span>
            <button
              type="button"
              onClick={() => {
                clearAuthTokens();
                void router.push("/login");
              }}
              className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-950/30 transition hover:bg-emerald-600"
            >
              {t.logout}
            </button>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
    </RequireAuth>
  );
}
