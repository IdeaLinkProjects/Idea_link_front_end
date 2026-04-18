import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useMemo, useState } from "react";
import { messages } from "@/locales";

type CategoryKey = keyof typeof messages.en.discovery.categories;

export default function DiscoveryPage() {
  const { locale, setLocale, theme, setTheme, isDark } = useAppPreferences();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryKey | "all">("all");
  const t = messages[locale];
  const d = t.discovery;

  const categoryEntries = useMemo(
    () => Object.entries(d.categories) as [CategoryKey, string][],
    [d.categories],
  );

  const filteredIdeas = useMemo(() => {
    const q = search.trim().toLowerCase();
    return d.ideas.filter((idea) => {
      const matchesCategory = category === "all" || idea.categoryKey === category;
      const matchesSearch =
        q.length === 0 ||
        idea.name.toLowerCase().includes(q) ||
        idea.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [d.ideas, search, category]);

  const chipBase = isDark
    ? "border-white/20 bg-white/5 text-zinc-100 hover:bg-white/10"
    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100";

  return (
    <>
      <Head>
        <title>{d.meta.title}</title>
        <meta name="description" content={d.meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className={`relative min-h-screen overflow-hidden ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}
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
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-2xl font-extrabold tracking-tight">
              <span className="text-primary-500">{t.brand.ideal}</span>
              <span className="text-primary-300">{t.brand.link}</span>
            </Link>
            <nav className="order-3 flex w-full basis-full items-center gap-1 sm:order-none sm:w-auto sm:basis-auto sm:gap-2">
              <Link
                href="/"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${isDark ? "text-zinc-300 hover:bg-white/10 hover:text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"}`}
              >
                {t.nav.home}
              </Link>
              <span
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${isDark ? "bg-white/10 text-primary-300" : "bg-primary-100 text-primary-800"}`}
              >
                {t.nav.discover}
              </span>
            </nav>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <div
                className={`inline-flex rounded-lg border p-1 ${isDark ? "border-white/20 bg-white/5" : "border-zinc-300 bg-white"}`}
              >
                <button
                  type="button"
                  onClick={() => setLocale("en")}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${locale === "en" ? "bg-primary-950 text-white" : isDark ? "text-zinc-200 hover:bg-white/10" : "text-zinc-700 hover:bg-zinc-100"}`}
                >
                  {t.nav.langEnglish}
                </button>
                <button
                  type="button"
                  onClick={() => setLocale("am")}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${locale === "am" ? "bg-primary-950 text-white" : isDark ? "text-zinc-200 hover:bg-white/10" : "text-zinc-700 hover:bg-zinc-100"}`}
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
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5 ${isDark ? "border-white/20 bg-white/5 text-zinc-100 hover:bg-white/10" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"}`}
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary-950 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-900/40 transition hover:-translate-y-0.5 hover:bg-primary-900"
              >
                {t.nav.register}
              </Link>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1
              className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-zinc-900"}`}
            >
              {d.heading}
            </h1>
            <p
              className={`mt-2 max-w-2xl text-sm sm:text-base ${isDark ? "text-zinc-400" : "text-zinc-600"}`}
            >
              {d.meta.description}
            </p>
          </div>

          <div
            className={`mb-8 flex flex-col gap-4 rounded-2xl border p-4 sm:p-5 ${isDark ? "border-white/15 bg-white/5" : "border-zinc-200 bg-white shadow-sm"}`}
          >
            <label className="block">
              <span className="sr-only">{d.searchPlaceholder}</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={d.searchPlaceholder}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary-600/40 ${isDark ? "border-white/20 bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500" : "border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400"}`}
              />
            </label>

            <div>
              <p
                className={`mb-2 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-zinc-500" : "text-zinc-500"}`}
              >
                {d.categorySectionTitle}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategory("all")}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${category === "all" ? "border-primary-500 bg-primary-950 text-white shadow-md shadow-primary-900/30" : chipBase}`}
                >
                  {d.allCategories}
                </button>
                {categoryEntries.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${category === key ? "border-primary-500 bg-primary-950 text-white shadow-md shadow-primary-900/30" : chipBase}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p
            className={`mb-4 text-sm font-medium ${isDark ? "text-zinc-400" : "text-zinc-600"}`}
          >
            {filteredIdeas.length} {d.resultsLabel}
          </p>

          {filteredIdeas.length === 0 ? (
            <p
              className={`rounded-2xl border p-8 text-center text-sm ${isDark ? "border-white/15 bg-white/5 text-zinc-300" : "border-zinc-200 bg-white text-zinc-600"}`}
            >
              {d.noResults}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredIdeas.map((idea) => {
                const catLabel = d.categories[idea.categoryKey as CategoryKey] ?? idea.categoryKey;
                return (
                  <article
                    key={idea.id}
                    className={`group flex flex-col overflow-hidden rounded-2xl border shadow-lg backdrop-blur-sm transition hover:-translate-y-1 hover:border-primary-500/50 ${isDark ? "border-white/15 bg-white/10 shadow-black/25" : "border-zinc-200 bg-white/95 shadow-zinc-200/60"}`}
                  >
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
                      <Image
                        src={idea.image}
                        alt={idea.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${isDark ? "border-white/15 bg-white/10 text-zinc-300" : "border-zinc-200 bg-zinc-100 text-zinc-700"}`}
                        >
                          <span aria-hidden="true">{idea.categoryIcon}</span>
                          {catLabel}
                        </span>
                        <h2
                          className={`mt-3 text-lg font-bold leading-snug ${isDark ? "text-white" : "text-zinc-900"}`}
                        >
                          {idea.name}
                        </h2>
                      </div>
                    </div>
                    <p
                      className={`mt-2 flex-1 text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}
                    >
                      {idea.description}
                    </p>
                    <div className="mt-4">
                      <div
                        className={`h-2.5 w-full overflow-hidden rounded-full ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`}
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-950 to-primary-600 transition-all duration-700"
                          style={{ width: `${idea.fundedPercent}%` }}
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                        <span className={`font-semibold ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
                          {idea.fundedPercent}% {t.featured.funded}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 ${isDark ? "border-white/15 bg-white/10 text-zinc-300" : "border-zinc-200 bg-zinc-100 text-zinc-600"}`}
                        >
                          {idea.daysRemaining} {t.featured.daysLeft}
                        </span>
                      </div>
                      <p
                        className={`mt-2 text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}
                      >
                        {d.goalLabel}: {idea.goalEtb}
                      </p>
                    </div>
                    <Link
                      href={`/projects/${idea.id}`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary-950 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-primary-900"
                    >
                      {d.viewDetails}
                    </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        <footer className={`mt-auto border-t ${isDark ? "border-white/10" : "border-zinc-200"}`}>
          <div
            className={`mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-6 text-sm sm:px-6 lg:px-8 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}
          >
            <Link href="/" className={`transition ${isDark ? "hover:text-white" : "hover:text-zinc-900"}`}>
              {t.nav.home}
            </Link>
            <Link href="/about" className={`transition ${isDark ? "hover:text-white" : "hover:text-zinc-900"}`}>
              {t.footer.about}
            </Link>
            <Link href="/contact" className={`transition ${isDark ? "hover:text-white" : "hover:text-zinc-900"}`}>
              {t.footer.contact}
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
