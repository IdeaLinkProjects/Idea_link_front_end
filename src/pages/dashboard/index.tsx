import Head from "next/head";
import Link from "next/link";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { messages } from "@/locales";

export default function DashboardHomePage() {
  const { locale, isDark } = useAppPreferences();

  const shell = messages[locale].commonDashboard;
  const ti = messages[locale].innovatorDashboard;
  const iv = messages[locale].investorDashboard;

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
    ? "border-primary-500/30 bg-gradient-to-br from-primary-950/50 to-zinc-900/80"
    : "border-primary-200/80 bg-gradient-to-br from-primary-50 to-white";

  const welcomeName = shell.userFirstName;

  return (
    <>
      <Head>
        <title>{shell.homeMetaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardLayout>
        <div className="mx-auto max-w-6xl space-y-12">
          <DashboardPageHeader title={ti.welcome.replace("{name}", welcomeName)} subtitle={ti.today.replace("{date}", dateLabel)} />

          <section className="space-y-6">
            <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{shell.sectionCampaigns}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className={`rounded-2xl border p-5 ${statCard}`}>
                <p className={`text-sm font-medium ${isDark ? "text-primary-400/90" : "text-primary-800"}`}>{ti.statsActive}</p>
                <p className={`mt-2 text-3xl font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>{ti.stats.activeCount}</p>
              </div>
              <div className={`rounded-2xl border p-5 ${statCard}`}>
                <p className={`text-sm font-medium ${isDark ? "text-primary-400/90" : "text-primary-800"}`}>{ti.statsPending}</p>
                <p className={`mt-2 text-3xl font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>{ti.stats.pendingCount}</p>
              </div>
              <div className={`rounded-2xl border p-5 ${statCard}`}>
                <p className={`text-sm font-medium ${isDark ? "text-primary-400/90" : "text-primary-800"}`}>{ti.statsRaised}</p>
                <p className={`mt-2 text-3xl font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>{ti.stats.raised}</p>
              </div>
            </div>

            <Link
              href="/dashboard/projects/new"
              className="flex w-full items-center justify-center rounded-2xl bg-primary-950 px-6 py-4 text-center text-base font-semibold text-white shadow-xl shadow-primary-950/40 transition hover:bg-primary-900 sm:py-4"
            >
              {ti.createProject}
            </Link>

            <div>
              <h3 className={`mb-4 text-base font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{ti.activeProjectsTitle}</h3>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {ti.mockProjects.map((project) => (
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
                          className="h-full rounded-full bg-gradient-to-r from-primary-950 to-primary-600"
                          style={{ width: `${project.percent}%` }}
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className={`font-semibold ${isDark ? "text-primary-300" : "text-primary-800"}`}>{project.percent}%</span>
                        <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>
                          {project.investors} {ti.investors}
                        </span>
                        <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>
                          {project.daysRemaining} {ti.daysLeft}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/projects/${project.slug}`}
                        className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm font-semibold transition ${isDark ? "border-white/20 bg-white/5 hover:bg-white/10" : "border-zinc-300 bg-white hover:bg-zinc-50"}`}
                      >
                        {ti.viewDetails}
                      </Link>
                      <Link
                        href={`/dashboard/projects/${project.slug}?tab=updates&compose=1`}
                        className="flex-1 rounded-lg bg-primary-950 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-primary-900"
                      >
                        {ti.postUpdate}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{shell.sectionInvesting}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className={`rounded-2xl border p-5 ${statCard}`}>
                <p className={`text-sm font-medium ${isDark ? "text-primary-400/90" : "text-primary-800"}`}>{iv.statsActiveInvestments}</p>
                <p className={`mt-2 text-3xl font-extrabold tabular-nums ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {iv.stats.activeCount}
                </p>
              </div>
              <div className={`rounded-2xl border p-5 ${statCard}`}>
                <p className={`text-sm font-medium ${isDark ? "text-primary-400/90" : "text-primary-800"}`}>{iv.statsTotalInvested}</p>
                <p className={`mt-2 text-3xl font-extrabold tabular-nums ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {iv.stats.totalInvested}
                </p>
              </div>
              <div className={`rounded-2xl border p-5 ${statCard}`}>
                <p className={`text-sm font-medium ${isDark ? "text-primary-400/90" : "text-primary-800"}`}>{iv.statsAvgFunded}</p>
                <p className={`mt-2 text-3xl font-extrabold tabular-nums ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {iv.stats.avgFunded}
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="flex w-full items-center justify-center rounded-2xl bg-primary-950 px-6 py-4 text-center text-base font-semibold text-white shadow-xl shadow-primary-950/40 transition hover:bg-primary-900 sm:py-4"
            >
              {iv.browseProjects}
            </Link>

            <div>
              <h3 className={`mb-4 text-base font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{iv.recommendedTitle}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {iv.recommended.map((project) => (
                  <article key={project.id} className={`rounded-2xl border p-5 ${cardClass}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{project.name}</h3>
                        <p className={`mt-1 text-sm ${isDark ? "text-primary-400/90" : "text-primary-800"}`}>
                          {project.categoryIcon} {project.category}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-bold tabular-nums ${isDark ? "text-primary-300" : "text-primary-800"}`}>{project.percent}%</span>
                        <span className={isDark ? "text-zinc-500" : "text-zinc-500"}>{iv.fundedLabel}</span>
                      </div>
                      <div className={`mt-2 h-2.5 w-full overflow-hidden rounded-full ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-950 to-primary-600"
                          style={{ width: `${project.percent}%` }}
                        />
                      </div>
                    </div>
                    <Link
                      href={`/projects/${project.id}`}
                      className={`mt-4 flex w-full justify-center rounded-xl border px-4 py-2.5 text-center text-sm font-semibold transition ${
                        isDark ? "border-primary-500/40 text-primary-200 hover:bg-primary-950/40" : "border-primary-200 text-primary-900 hover:bg-primary-50"
                      }`}
                    >
                      {iv.viewDetails}
                    </Link>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h3 className={`mb-4 text-base font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{iv.recentInvestmentsTitle}</h3>
              <div className={`rounded-2xl border ${cardClass}`}>
                <ul className={`divide-y ${isDark ? "divide-white/10" : "divide-zinc-200"}`}>
                  {iv.recentInvestments.map((row, i) => (
                    <li key={i} className={`px-4 py-4 ${isDark ? "hover:bg-white/5" : "hover:bg-zinc-50"}`}>
                      <p className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{row.project}</p>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className={`font-bold tabular-nums ${isDark ? "text-primary-300" : "text-primary-800"}`}>{row.amountEtb}</span>
                        <span className={isDark ? "text-zinc-500" : "text-zinc-500"}>{row.date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </DashboardLayout>
    </>
  );
}
