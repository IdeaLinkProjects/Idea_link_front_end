import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { InnovatorLayout } from "@/components/innovator/InnovatorLayout";
import am from "@/locales/am.json";
import en from "@/locales/en.json";

type Locale = "en" | "am";

const messages = { en, am } as const;

export default function InnovatorDashboardPage() {
  const [locale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const s = window.localStorage.getItem("ideal-link-locale");
    return s === "am" || s === "en" ? s : "en";
  });
  const [theme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    const s = window.localStorage.getItem("ideal-link-theme");
    return s === "light" || s === "dark" ? s : "dark";
  });

  const t = messages[locale].innovatorDashboard;
  const isDark = theme === "dark";

  const dateLabel = useMemo(() => {
    return new Intl.DateTimeFormat(locale === "am" ? "am-ET" : "en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }, [locale]);

  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";
  const statCard = isDark
    ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 to-zinc-900/80"
    : "border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white";

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <InnovatorLayout>
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-zinc-900"}`}>
              {t.welcome.replace("{name}", t.userFirstName)}
            </h1>
            <p className={`mt-1 text-sm sm:text-base ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              {t.today.replace("{date}", dateLabel)}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className={`rounded-2xl border p-5 ${statCard}`}>
              <p className={`text-sm font-medium ${isDark ? "text-emerald-400/90" : "text-emerald-800"}`}>{t.statsActive}</p>
              <p className={`mt-2 text-3xl font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.stats.activeCount}</p>
            </div>
            <div className={`rounded-2xl border p-5 ${statCard}`}>
              <p className={`text-sm font-medium ${isDark ? "text-emerald-400/90" : "text-emerald-800"}`}>{t.statsPending}</p>
              <p className={`mt-2 text-3xl font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.stats.pendingCount}</p>
            </div>
            <div className={`rounded-2xl border p-5 ${statCard}`}>
              <p className={`text-sm font-medium ${isDark ? "text-emerald-400/90" : "text-emerald-800"}`}>{t.statsRaised}</p>
              <p className={`mt-2 text-3xl font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.stats.raised}</p>
            </div>
          </div>

          <Link
            href="/innovator/projects/new"
            className="flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-6 py-4 text-center text-base font-semibold text-white shadow-xl shadow-emerald-950/40 transition hover:bg-emerald-600 sm:py-4"
          >
            {t.createProject}
          </Link>

          <section>
            <h2 className={`mb-4 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.activeProjectsTitle}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {t.mockProjects.map((project) => (
                <article key={project.slug} className={`flex flex-col rounded-2xl border p-5 ${cardClass}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{project.name}</h3>
                    <span className="text-2xl" aria-hidden>
                      {project.categoryIcon}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className={`h-2.5 w-full overflow-hidden rounded-full ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-500"
                        style={{ width: `${project.percent}%` }}
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className={`font-semibold ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>{project.percent}%</span>
                      <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>
                        {project.investors} {t.investors}
                      </span>
                      <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>
                        {project.daysRemaining} {t.daysLeft}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/innovator/projects/${project.slug}`}
                      className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm font-semibold transition ${isDark ? "border-white/20 bg-white/5 hover:bg-white/10" : "border-zinc-300 bg-white hover:bg-zinc-50"}`}
                    >
                      {t.viewDetails}
                    </Link>
                    <Link
                      href={`/innovator/projects/${project.slug}?tab=updates&compose=1`}
                      className="flex-1 rounded-lg bg-emerald-700 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-emerald-600"
                    >
                      {t.postUpdate}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className={`mb-4 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.recentMessages}</h2>
            <div className={`rounded-2xl border ${cardClass}`}>
              <ul className={`divide-y ${isDark ? "divide-white/10" : "divide-zinc-200"}`}>
                {t.mockMessages.map((m) => (
                  <li
                    key={m.from + m.time}
                    className={`flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${isDark ? "hover:bg-white/5" : "hover:bg-zinc-50"}`}
                  >
                    <div>
                      <p className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{m.from}</p>
                      <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{m.preview}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{m.time}</span>
                      <Link
                        href="/innovator/messages"
                        className="text-sm font-semibold text-emerald-500 hover:text-emerald-400"
                      >
                        {t.reply}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </InnovatorLayout>
    </>
  );
}
