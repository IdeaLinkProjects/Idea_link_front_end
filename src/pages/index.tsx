import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function Home() {
  const { locale, setLocale, theme, setTheme, isDark } = useAppPreferences();
  const t = messages[locale];

  return (
    <>
      <Head>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className={`relative min-h-screen overflow-hidden ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}
      >
        <div
          className={`pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full blur-3xl ${isDark ? "bg-emerald-500/30" : "bg-emerald-400/30"}`}
        />
        <div
          className={`pointer-events-none absolute top-20 -right-16 h-80 w-80 rounded-full blur-3xl ${isDark ? "bg-emerald-700/25" : "bg-emerald-600/25"}`}
        />
        <div
          className={`pointer-events-none absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${isDark ? "bg-emerald-300/15" : "bg-emerald-500/15"}`}
        />

        <header
          className={`sticky top-0 z-20 border-b backdrop-blur-xl ${isDark ? "border-white/10 bg-zinc-950/70" : "border-zinc-200 bg-white/80"}`}
        >
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-4 sm:flex-initial">
              <Link href="/" className="text-2xl font-extrabold tracking-tight">
                <span className="text-emerald-500">{t.brand.ideal}</span>
                <span className="text-emerald-300">{t.brand.link}</span>
              </Link>
              <Link
                href="/discovery"
                className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition sm:px-3 sm:py-2 sm:text-sm ${isDark ? "text-emerald-300 hover:bg-white/10" : "text-emerald-800 hover:bg-emerald-100"}`}
              >
                {t.nav.discover}
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`inline-flex rounded-lg border p-1 ${isDark ? "border-white/20 bg-white/5" : "border-zinc-300 bg-white"}`}
              >
                <button
                  type="button"
                  onClick={() => setLocale("en")}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${locale === "en" ? "bg-emerald-700 text-white" : isDark ? "text-zinc-200 hover:bg-white/10" : "text-zinc-700 hover:bg-zinc-100"}`}
                >
                  {t.nav.langEnglish}
                </button>
                <button
                  type="button"
                  onClick={() => setLocale("am")}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${locale === "am" ? "bg-emerald-700 text-white" : isDark ? "text-zinc-200 hover:bg-white/10" : "text-zinc-700 hover:bg-zinc-100"}`}
                >
                  {t.nav.langAmharic}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5 ${isDark ? "border-white/20 bg-white/5 text-zinc-100 hover:bg-white/10" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"}`}
                aria-label="Toggle theme"
              >
                <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
                <span className="hidden sm:inline">
                  {isDark ? t.nav.themeLight : t.nav.themeDark}
                </span>
              </button>
              <Link
                href="/login"
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5 sm:px-4 ${isDark ? "border-white/20 bg-white/5 text-zinc-100 hover:bg-white/10" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"}`}
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:-translate-y-0.5 hover:bg-emerald-600 sm:px-4"
              >
                {t.nav.register}
              </Link>
            </div>
          </div>
        </header>

        <main className="relative z-10">
          <section className="mx-auto w-full max-w-6xl px-4 pt-14 pb-10 text-center sm:px-6 lg:px-8 lg:pt-20">
            <p
              className={`mx-auto mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? "border-white/15 bg-white/10 text-zinc-200" : "border-emerald-300 bg-emerald-100 text-emerald-800"}`}
            >
              {t.hero.badge}
            </p>
            <h1
              className={`mx-auto max-w-4xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-6xl ${isDark ? "text-white" : "text-zinc-900"}`}
            >
              {t.hero.title}
            </h1>
            <p
              className={`mx-auto mt-5 max-w-2xl text-base sm:text-lg ${isDark ? "text-zinc-300" : "text-zinc-600"}`}
            >
              {t.hero.subtitle}
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register?role=innovator"
                className="rounded-xl bg-emerald-700 px-6 py-3 text-center text-base font-semibold text-white shadow-xl shadow-emerald-900/40 transition hover:-translate-y-1 hover:bg-emerald-600"
              >
                {t.hero.registerInnovator}
              </Link>
              <Link
                href="/register?role=investor"
                className={`rounded-xl border px-6 py-3 text-center text-base font-semibold shadow-xl transition hover:-translate-y-1 ${isDark ? "border-emerald-500/40 bg-emerald-900/50 text-emerald-100 shadow-emerald-950/40 hover:bg-emerald-800/70" : "border-emerald-600/30 bg-emerald-100 text-emerald-900 shadow-emerald-700/20 hover:bg-emerald-200"}`}
              >
                {t.hero.registerInvestor}
              </Link>
            </div>
          </section>

          <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {t.statistics.map((stat) => (
                <article
                  key={stat.label}
                  className={`group rounded-2xl border p-6 text-center backdrop-blur-md transition hover:-translate-y-1 ${isDark ? "border-white/15 bg-white/10 hover:bg-white/15" : "border-zinc-200 bg-white/90 hover:bg-white"}`}
                >
                  <p
                    className={`text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}
                  >
                    {stat.value}
                  </p>
                  <p
                    className={`mt-1 text-sm font-medium ${isDark ? "text-zinc-300" : "text-zinc-600"}`}
                  >
                    {stat.label}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
            <div
              className={`relative overflow-hidden rounded-3xl border p-8 text-center sm:p-10 ${isDark ? "border-white/15 bg-gradient-to-br from-emerald-950/60 to-zinc-950/80" : "border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white"}`}
            >
              <h2
                className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-zinc-900"}`}
              >
                {t.discoveryCta.title}
              </h2>
              <p
                className={`mx-auto mt-3 max-w-2xl text-sm sm:text-base ${isDark ? "text-zinc-400" : "text-zinc-600"}`}
              >
                {t.discoveryCta.subtitle}
              </p>
              <Link
                href="/discovery"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-700 px-8 py-3 text-base font-semibold text-white shadow-xl shadow-emerald-900/35 transition hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                {t.discoveryCta.button}
              </Link>
            </div>
          </section>

          <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2
                className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}
              >
                {t.featured.title}
              </h2>
              <Link
                href="/discovery"
                className={`text-sm font-semibold transition hover:underline ${isDark ? "text-emerald-400" : "text-emerald-700"}`}
              >
                {t.nav.discover} →
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {t.featured.projects.map((project) => (
                <article
                  key={project.name}
                  className={`group overflow-hidden rounded-2xl border shadow-lg backdrop-blur-md transition hover:-translate-y-1 hover:border-emerald-500/60 ${isDark ? "border-white/15 bg-white/10 shadow-black/20 hover:bg-white/15" : "border-zinc-200 bg-white/95 shadow-zinc-200/70 hover:bg-white"}`}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-90"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-base font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}
                    >
                      {project.name}
                    </h3>
                    <span className="text-2xl transition group-hover:scale-110" aria-hidden="true">
                      {project.categoryIcon}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div
                      className={`h-2.5 w-full overflow-hidden rounded-full ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-500 transition-all duration-700"
                        style={{
                          width: `${project.fundedPercent}%`,
                        }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className={`font-semibold ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
                        {project.fundedPercent}% {t.featured.funded}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 ${isDark ? "border-white/15 bg-white/10 text-zinc-300" : "border-zinc-200 bg-zinc-100 text-zinc-600"}`}
                      >
                        {project.daysRemaining} {t.featured.daysLeft}
                      </span>
                    </div>
                  </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        <footer className={`border-t ${isDark ? "border-white/10" : "border-zinc-200"}`}>
          <div
            className={`mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-6 text-sm sm:px-6 lg:px-8 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}
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
