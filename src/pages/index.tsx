import Head from "next/head";
import Link from "next/link";
import { HomeDiscoverySection } from "@/components/discovery/HomeDiscoverySection";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { hasStoredAuthTokens } from "@/lib/auth/tokenStorage";
import { useEffect, useRef, useState } from "react";
import { messages } from "@/locales";

export default function Home() {
  const { locale, setLocale, setTheme, isDark } = useAppPreferences();
  const [loggedIn, setLoggedIn] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const t = messages[locale];
  const d = t.discovery;

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

  return (
    <>
      <Head>
        <title>{d.meta.title}</title>
        <meta name="description" content={d.meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className={`relative flex min-h-dvh flex-col overflow-x-hidden ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}
      >
        <div
          className={`pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full blur-3xl ${isDark ? "bg-primary-500/25" : "bg-primary-400/25"}`}
        />
        <div
          className={`pointer-events-none absolute top-32 -right-24 h-96 w-96 rounded-full blur-3xl ${isDark ? "bg-primary-950/20" : "bg-primary-600/20"}`}
        />

        <header
          className={`sticky top-0 z-20 border-b backdrop-blur-xl ${isDark ? "border-white/10 bg-zinc-950/70" : "border-zinc-200 bg-white/80"}`}
        >
          <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5 lg:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-4 sm:flex-initial">
              <Link href="/" className="text-2xl font-extrabold tracking-tight">
                <span className="text-primary-500">{t.brand.ideal}</span>
                <span className="text-primary-300">{t.brand.link}</span>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <div className="relative" ref={langMenuRef}>
                <button
                  type="button"
                  onClick={() => setLangOpen((o) => !o)}
                  aria-expanded={langOpen}
                  aria-haspopup="listbox"
                  aria-label={t.nav.language}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-sm font-semibold transition hover:-translate-y-0.5 ${isDark ? "border-white/20 bg-white/5 text-zinc-100 hover:bg-white/10" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"}`}
                >
                  {locale === "en" ? t.nav.langEnglish : t.nav.langAmharic}
                  <span className="text-[10px] opacity-70" aria-hidden>
                    ▾
                  </span>
                </button>
                {langOpen ? (
                  <ul
                    role="listbox"
                    className={`absolute right-0 z-30 mt-1 min-w-[9rem] overflow-hidden rounded-lg border py-1 shadow-lg ${isDark ? "border-white/15 bg-zinc-900 text-zinc-100" : "border-zinc-200 bg-white text-zinc-900"}`}
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
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5 ${isDark ? "border-white/20 bg-white/5 text-zinc-100 hover:bg-white/10" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"}`}
                aria-label={isDark ? t.nav.themeLight : t.nav.themeDark}
              >
                <span aria-hidden="true" className="text-base leading-none">
                  {isDark ? "☀" : "☾"}
                </span>
                <span>{isDark ? t.nav.themeLight : t.nav.themeDark}</span>
              </button>
              <Link
                href={loggedIn ? "/dashboard" : "/login"}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5 ${isDark ? "border-white/20 bg-white/5 text-zinc-100 hover:bg-white/10" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"}`}
              >
                {loggedIn ? t.nav.dashboard : t.nav.login}
              </Link>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-screen-2xl flex-1 flex-col px-4 py-6 sm:px-5 sm:py-8 lg:px-6">
          <section
            className={`relative mb-5 shrink-0 overflow-hidden rounded-2xl border sm:mb-6 ${
              isDark
                ? "border-white/[0.08] bg-zinc-900/80 shadow-lg shadow-black/20"
                : "border-zinc-200/90 bg-white shadow-md shadow-zinc-900/[0.04]"
            }`}
          >
            <div
              className={`pointer-events-none absolute right-0 top-0 h-32 w-48 translate-x-1/4 -translate-y-1/4 rounded-full blur-2xl ${isDark ? "bg-primary-500/15" : "bg-primary-400/20"}`}
              aria-hidden
            />
            <div
              className={`relative flex flex-col gap-3 border-l-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-4 lg:px-6 ${
                isDark ? "border-l-primary-400" : "border-l-primary-600"
              }`}
            >
              <div className="min-w-0">
                <p
                  className={`mb-1.5 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:text-[11px] ${
                    isDark
                      ? "border-primary-500/30 bg-primary-950/60 text-primary-200/95"
                      : "border-primary-200 bg-primary-50 text-primary-900"
                  }`}
                >
                  <span className="text-xs leading-none opacity-90" aria-hidden>
                    ✦
                  </span>
                  {t.hero.badge}
                </p>
                <h1
                  className={`text-2xl font-bold leading-tight tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-zinc-900"}`}
                >
                  {d.heading}
                </h1>
              </div>
              <p
                className={`max-w-full text-sm leading-snug sm:max-w-md sm:text-right sm:leading-relaxed lg:max-w-lg ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                {d.meta.description}
              </p>
            </div>
          </section>

          <HomeDiscoverySection />
        </main>

        <footer className={`mt-auto border-t ${isDark ? "border-white/10" : "border-zinc-200"}`}>
          <div
            className={`mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-6 text-sm sm:px-5 lg:px-6 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}
          >
            <Link href="/about" className={`transition ${isDark ? "hover:text-white" : "hover:text-zinc-900"}`}>
              {t.footer.about}
            </Link>
            <Link
              href="/contact"
              className={`transition ${isDark ? "hover:text-white" : "hover:text-zinc-900"}`}
            >
              {t.footer.contact}
            </Link>
            <Link
              href="/privacy"
              className={`transition ${isDark ? "hover:text-white" : "hover:text-zinc-900"}`}
            >
              {t.footer.privacy}
            </Link>
            <Link href="/terms" className={`transition ${isDark ? "hover:text-white" : "hover:text-zinc-900"}`}>
              {t.footer.terms}
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
