import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { InvestorLayout } from "@/components/investor/InvestorLayout";
import am from "@/locales/am.json";
import en from "@/locales/en.json";

type Locale = "en" | "am";

const messages = { en, am } as const;

export default function InvestorDashboardPage() {
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

  const t = messages[locale].investorDashboard;
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
      <InvestorLayout>
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
              <p className={`text-sm font-medium ${isDark ? "text-emerald-400/90" : "text-emerald-800"}`}>{t.statsActiveInvestments}</p>
              <p className={`mt-2 text-3xl font-extrabold tabular-nums ${isDark ? "text-white" : "text-zinc-900"}`}>
                {t.stats.activeCount}
              </p>
            </div>
            <div className={`rounded-2xl border p-5 ${statCard}`}>
              <p className={`text-sm font-medium ${isDark ? "text-emerald-400/90" : "text-emerald-800"}`}>{t.statsTotalInvested}</p>
              <p className={`mt-2 text-3xl font-extrabold tabular-nums ${isDark ? "text-white" : "text-zinc-900"}`}>
                {t.stats.totalInvested}
              </p>
            </div>
            <div className={`rounded-2xl border p-5 ${statCard}`}>
              <p className={`text-sm font-medium ${isDark ? "text-emerald-400/90" : "text-emerald-800"}`}>{t.statsAvgFunded}</p>
              <p className={`mt-2 text-3xl font-extrabold tabular-nums ${isDark ? "text-white" : "text-zinc-900"}`}>
                {t.stats.avgFunded}
              </p>
            </div>
          </div>

          <Link
            href="/discovery"
            className="flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-6 py-4 text-center text-base font-semibold text-white shadow-xl shadow-emerald-950/40 transition hover:bg-emerald-600 sm:py-4"
          >
            {t.browseProjects}
          </Link>

          <section>
            <h2 className={`mb-4 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.recommendedTitle}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {t.recommended.map((project) => (
                <article key={project.id} className={`rounded-2xl border p-5 ${cardClass}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{project.name}</h3>
                      <p className={`mt-1 text-sm ${isDark ? "text-emerald-400/90" : "text-emerald-800"}`}>
                        {project.categoryIcon} {project.category}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-bold tabular-nums ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>{project.percent}%</span>
                      <span className={isDark ? "text-zinc-500" : "text-zinc-500"}>{t.fundedLabel}</span>
                    </div>
                    <div className={`mt-2 h-2.5 w-full overflow-hidden rounded-full ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-500"
                        style={{ width: `${project.percent}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className={`mt-4 flex w-full justify-center rounded-xl border px-4 py-2.5 text-center text-sm font-semibold transition ${
                      isDark ? "border-emerald-500/40 text-emerald-200 hover:bg-emerald-950/40" : "border-emerald-200 text-emerald-900 hover:bg-emerald-50"
                    }`}
                  >
                    {t.viewDetails}
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className={`mb-4 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.recentInvestmentsTitle}</h2>
              <div className={`rounded-2xl border ${cardClass}`}>
                <ul className={`divide-y ${isDark ? "divide-white/10" : "divide-zinc-200"}`}>
                  {t.recentInvestments.map((row, i) => (
                    <li key={i} className={`px-4 py-4 ${isDark ? "hover:bg-white/5" : "hover:bg-zinc-50"}`}>
                      <p className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{row.project}</p>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className={`font-bold tabular-nums ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>{row.amountEtb}</span>
                        <span className={isDark ? "text-zinc-500" : "text-zinc-500"}>{row.date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h2 className={`mb-4 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.activityTitle}</h2>
              <div className={`rounded-2xl border ${cardClass}`}>
                <ul className={`divide-y ${isDark ? "divide-white/10" : "divide-zinc-200"}`}>
                  {t.activityFeed.map((row, i) => (
                    <li key={i} className={`px-4 py-4 ${isDark ? "hover:bg-white/5" : "hover:bg-zinc-50"}`}>
                      <p className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
                        {row.project}
                      </p>
                      <p className={`mt-1 text-sm ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{row.snippet}</p>
                      <p className={`mt-2 text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{row.time}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </InvestorLayout>
    </>
  );
}
