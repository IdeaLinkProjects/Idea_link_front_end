import Head from "next/head";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function DashboardProjectsPage() {
  const { locale, isDark } = useAppPreferences();

  const t = messages[locale].innovatorDashboard;
  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";

  return (
    <>
      <Head>
        <title>{t.projectsMetaTitle}</title>
      </Head>
      <DashboardLayout>
        <div className="mx-auto max-w-6xl space-y-6">
          <DashboardPageHeader
            title={t.projectsPageTitle}
            subtitle={t.projectsPageSubtitle}
            actions={
              <Link
                href="/dashboard/projects/new"
                className="inline-flex justify-center rounded-xl bg-primary-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-primary-900"
              >
                {t.createProject}
              </Link>
            }
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {t.mockProjects.map((project) => (
              <article key={project.slug} className={`rounded-2xl border p-5 ${cardClass}`}>
                <div className="flex items-start justify-between gap-2">
                  <h2 className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{project.name}</h2>
                  <span className="text-xl" aria-hidden>
                    {project.categoryIcon}
                  </span>
                </div>
                <div className={`mt-3 h-2 overflow-hidden rounded-full ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-950 to-primary-600"
                    style={{ width: `${project.percent}%` }}
                  />
                </div>
                <p className={`mt-2 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  {project.percent}% · {project.investors} {t.investors} · {project.daysRemaining} {t.daysLeft}
                </p>
                <Link
                  href={`/dashboard/projects/${project.slug}`}
                  className={`mt-4 inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${isDark ? "bg-primary-900/50 text-primary-200 hover:bg-primary-900/70" : "bg-primary-950 text-white hover:bg-primary-950"}`}
                >
                  {t.manageProject}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
