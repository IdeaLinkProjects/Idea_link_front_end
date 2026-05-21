import Head from "next/head";
import Link from "next/link";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { messages } from "@/locales";

export default function DashboardHomePage() {
  const { locale, isDark } = useAppPreferences();
  const { activeWorkspace } = useWorkspace();

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

  const welcomeName = shell.userFirstName;
  const pageTitle = activeWorkspace === "innovator" ? ti.welcome.replace("{name}", welcomeName) : iv.welcome.replace("{name}", welcomeName);
  const pageSubtitle =
    activeWorkspace === "innovator" ? ti.today.replace("{date}", dateLabel) : iv.today.replace("{date}", dateLabel);

  const cardClass = useMemo(() => {
    const accent =
      activeWorkspace === "investor"
        ? isDark
          ? "border-primary-700/25 shadow-primary-950/25"
          : "border-primary-300/80 shadow-primary-100/60"
        : isDark
          ? "border-primary-500/20 shadow-black/20"
          : "border-primary-200/70 shadow-zinc-200/60";
    const base = isDark
      ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
      : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";
    return `${base} ${accent}`;
  }, [isDark, activeWorkspace]);

  const statCard = useMemo(() => {
    if (activeWorkspace === "investor") {
      return isDark
        ? "border-primary-700/40 bg-gradient-to-br from-primary-950/55 to-zinc-900/85"
        : "border-primary-300/90 bg-gradient-to-br from-primary-100 via-white to-slate-50";
    }
    return isDark
      ? "border-primary-500/30 bg-gradient-to-br from-primary-950/25 to-zinc-900/85"
      : "border-primary-200/80 bg-gradient-to-br from-primary-50 via-white to-slate-50";
  }, [activeWorkspace, isDark]);

  const statLabel = isDark ? "text-primary-300/90" : "text-primary-800";
  const statValue = isDark ? "text-white" : "text-zinc-900";
  const progressBar = "bg-gradient-to-r from-primary-950 via-primary-600 to-primary-400";
  const percentLabel = isDark ? "text-primary-300" : "text-primary-800";
  const primaryCtaClass = "shadow-xl shadow-primary-950/40 hover:bg-primary-900";

  return (
    <>
      <Head>
        <title>{shell.homeMetaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardLayout>
        <div className="mx-auto max-w-6xl space-y-12">
          <DashboardPageHeader title={pageTitle} subtitle={pageSubtitle} />

          <div key={activeWorkspace} className="animate-workspace-content space-y-12">
            {activeWorkspace === "innovator" ? (
              <section className="space-y-6">
                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{shell.sectionCampaigns}</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className={`rounded-2xl border p-5 transition hover:border-primary-400/40 ${statCard}`}>
                    <p className={`text-sm font-medium ${statLabel}`}>{ti.statsActive}</p>
                    <p className={`mt-2 text-3xl font-extrabold ${statValue}`}>{ti.stats.activeCount}</p>
                  </div>
                  <div className={`rounded-2xl border p-5 transition hover:border-primary-400/40 ${statCard}`}>
                    <p className={`text-sm font-medium ${statLabel}`}>{ti.statsPending}</p>
                    <p className={`mt-2 text-3xl font-extrabold ${statValue}`}>{ti.stats.pendingCount}</p>
                  </div>
                  <div className={`rounded-2xl border p-5 transition hover:border-primary-400/40 ${statCard}`}>
                    <p className={`text-sm font-medium ${statLabel}`}>{ti.statsRaised}</p>
                    <p className={`mt-2 text-3xl font-extrabold ${statValue}`}>{ti.stats.raised}</p>
                  </div>
                </div>

                <Link
                  href="/dashboard/projects/new"
                  className={`flex w-full items-center justify-center rounded-2xl bg-primary-950 px-6 py-4 text-center text-base font-semibold text-white transition sm:py-4 ${primaryCtaClass}`}
                >
                  {ti.createProject}
                </Link>

                <div>
                  <h3 className={`mb-4 text-base font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{ti.activeProjectsTitle}</h3>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {ti.mockProjects.map((project) => (
                      <article
                        key={project.slug}
                        className={`flex flex-col rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${cardClass}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{project.name}</h3>
                          <span className="text-2xl" aria-hidden>
                            {project.categoryIcon}
                          </span>
                        </div>
                        <div className="mt-4">
                          <div className={`h-2.5 w-full overflow-hidden rounded-full ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`}>
                            <div className={`h-full rounded-full ${progressBar}`} style={{ width: `${project.percent}%` }} />
                          </div>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                            <span className={`font-semibold ${percentLabel}`}>{project.percent}%</span>
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
            ) : (
              <section className="space-y-6">
                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{shell.sectionInvesting}</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className={`rounded-2xl border p-5 transition hover:border-primary-600/45 ${statCard}`}>
                    <p className={`text-sm font-medium ${statLabel}`}>{iv.statsActiveInvestments}</p>
                    <p className={`mt-2 text-3xl font-extrabold tabular-nums ${statValue}`}>{iv.stats.activeCount}</p>
                  </div>
                  <div className={`rounded-2xl border p-5 transition hover:border-primary-600/45 ${statCard}`}>
                    <p className={`text-sm font-medium ${statLabel}`}>{iv.statsTotalInvested}</p>
                    <p className={`mt-2 text-3xl font-extrabold tabular-nums ${statValue}`}>{iv.stats.totalInvested}</p>
                  </div>
                  <div className={`rounded-2xl border p-5 transition hover:border-primary-600/45 ${statCard}`}>
                    <p className={`text-sm font-medium ${statLabel}`}>{iv.statsAvgFunded}</p>
                    <p className={`mt-2 text-3xl font-extrabold tabular-nums ${statValue}`}>{iv.stats.avgFunded}</p>
                  </div>
                </div>

                <Link
                  href="/"
                  className={`flex w-full items-center justify-center rounded-2xl bg-primary-950 px-6 py-4 text-center text-base font-semibold text-white transition sm:py-4 ${primaryCtaClass}`}
                >
                  {iv.browseProjects}
                </Link>

                <div>
                  <h3 className={`mb-4 text-base font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{iv.recommendedTitle}</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {iv.recommended.map((project) => (
                      <article
                        key={project.id}
                        className={`rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${cardClass}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{project.name}</h3>
                            <p className={`mt-1 text-sm ${statLabel}`}>
                              {project.categoryIcon} {project.category}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className={`font-bold tabular-nums ${percentLabel}`}>{project.percent}%</span>
                            <span className={isDark ? "text-zinc-500" : "text-zinc-500"}>{iv.fundedLabel}</span>
                          </div>
                          <div className={`mt-2 h-2.5 w-full overflow-hidden rounded-full ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`}>
                            <div className={`h-full rounded-full ${progressBar}`} style={{ width: `${project.percent}%` }} />
                          </div>
                        </div>
                        <Link
                          href={`/projects/${project.id}`}
                          className={`mt-4 flex w-full justify-center rounded-xl border px-4 py-2.5 text-center text-sm font-semibold transition ${
                            isDark
                              ? "border-primary-500/45 text-primary-200 hover:bg-primary-950/50"
                              : "border-primary-300 text-primary-900 hover:bg-primary-50"
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
                        <li
                          key={i}
                          className={`px-4 py-4 transition ${isDark ? "hover:bg-primary-950/25" : "hover:bg-primary-50/80"}`}
                        >
                          <p className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{row.project}</p>
                          <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                            <span className={`font-bold tabular-nums ${percentLabel}`}>{row.amountEtb}</span>
                            <span className={isDark ? "text-zinc-500" : "text-zinc-500"}>{row.date}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
