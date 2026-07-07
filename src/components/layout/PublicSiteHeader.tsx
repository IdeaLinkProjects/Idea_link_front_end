import Link from "next/link";
import { useRouter } from "next/router";
import { IdealLinkLogo } from "@/components/brand/IdealLinkLogo";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { hasStoredAuthTokens } from "@/lib/auth/tokenStorage";
import { useEffect, useRef, useState } from "react";
import { messages } from "@/locales";

export type PublicSiteHeaderProps = {
  /** When set, a link is shown before the brand (e.g. back to Discovery). */
  backHref?: string;
  backLabel?: string;
  /** See-through bar over hero media (e.g. landing page). */
  transparent?: boolean;
};

export function PublicSiteHeader({ backHref, backLabel, transparent = false }: PublicSiteHeaderProps) {
  const router = useRouter();
  const { locale, setLocale, setTheme, isDark } = useAppPreferences();
  const [loggedIn, setLoggedIn] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const t = messages[locale];

  useEffect(() => {
    const sync = () => setLoggedIn(hasStoredAuthTokens());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [langOpen]);

  const onDiscovery = router.pathname === "/discovery";
  const navLinkHref = onDiscovery ? "/" : "/discovery";
  const navLinkLabel = onDiscovery ? t.nav.home : t.nav.discover;

  const navBtn = transparent
    ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
    : isDark
      ? "border-white/20 bg-white/5 text-zinc-100 hover:bg-white/10"
      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100";

  return (
    <header
      className={
        transparent
          ? "absolute top-0 right-0 left-0 z-50 border-b border-white/10 bg-transparent"
          : `sticky top-0 z-50 border-b backdrop-blur-xl ${isDark ? "border-white/10 bg-zinc-950/70" : "border-zinc-200 bg-white/80"}`
      }
    >
      <div className="mx-auto flex h-20 w-full max-w-screen-2xl items-center justify-between gap-3 px-8 sm:px-12 lg:px-16">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <IdealLinkLogo
            className="inline-flex min-w-0 shrink-0 items-center transition hover:opacity-90"
            width={280}
            height={76}
            imageClassName="h-16 w-auto"
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Link
            href={navLinkHref}
            className={`hidden rounded-lg border px-3 py-2 text-sm font-semibold transition hover:-translate-y-0.5 sm:inline-flex ${navBtn}`}
          >
            {navLinkLabel}
          </Link>
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              aria-expanded={langOpen}
              aria-haspopup="listbox"
              aria-label={t.nav.language}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-sm font-semibold transition hover:-translate-y-0.5 ${navBtn}`}
            >
              {locale === "en" ? t.nav.langEnglish : t.nav.langAmharic}
              <span className="text-[10px] opacity-70" aria-hidden>
                ▾
              </span>
            </button>
            {langOpen ? (
              <ul
                role="listbox"
                className={`absolute right-0 z-[60] mt-1 min-w-[9rem] overflow-hidden rounded-lg border py-1 shadow-lg ${isDark ? "border-white/15 bg-zinc-900 text-zinc-100" : "border-zinc-200 bg-white text-zinc-900"}`}
              >
                <li role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={locale === "en"}
                    className={`flex w-full px-3 py-2 text-left text-sm font-medium ${locale === "en" ? (isDark ? "bg-white/10" : "bg-primary-50") : "hover:bg-black/5 dark:hover:bg-white/10"}`}
                    onClick={() => {
                      setLocale("en");
                      setLangOpen(false);
                    }}
                  >
                    English ({t.nav.langEnglish})
                  </button>
                </li>
                <li role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={locale === "am"}
                    className={`flex w-full px-3 py-2 text-left text-sm font-medium ${locale === "am" ? (isDark ? "bg-white/10" : "bg-primary-50") : "hover:bg-black/5 dark:hover:bg-white/10"}`}
                    onClick={() => {
                      setLocale("am");
                      setLangOpen(false);
                    }}
                  >
                    አማርኛ ({t.nav.langAmharic})
                  </button>
                </li>
              </ul>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5 ${navBtn}`}
            aria-label={isDark ? t.nav.themeLight : t.nav.themeDark}
          >
            <span aria-hidden="true" className="text-base leading-none">
              {isDark ? "☀" : "☾"}
            </span>
            <span>{isDark ? t.nav.themeLight : t.nav.themeDark}</span>
          </button>
          <Link
            href={loggedIn ? "/dashboard" : "/login"}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5 ${navBtn}`}
          >
            {loggedIn ? t.nav.dashboard : t.nav.login}
          </Link>
        </div>
      </div>
    </header>
  );
}
