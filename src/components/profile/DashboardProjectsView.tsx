import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardPagination } from "@/components/ui/DashboardPagination";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import { useGetMyCampaignsQuery } from "@/store";

const PAGE_SIZE = 6;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(isoDate: string) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DashboardProjectsView() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].innovatorDashboard;
  const [page, setPage] = useState(0);
  const request = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
    }),
    [page],
  );
  const campaignsQuery = useGetMyCampaignsQuery(request);
  const campaigns = campaignsQuery.data?.content ?? [];
  const totalPages = campaignsQuery.data?.totalPages ?? 0;

  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";

  return (
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

      {campaignsQuery.isLoading || campaignsQuery.isFetching ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <article key={idx} className={`animate-pulse rounded-2xl border p-5 ${cardClass}`}>
              <div className={`h-5 w-2/3 rounded ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`} />
              <div className={`mt-3 h-3 w-full rounded ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`} />
              <div className={`mt-2 h-3 w-4/5 rounded ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`} />
              <div className={`mt-5 h-2 w-full rounded ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`} />
              <div className={`mt-4 h-9 w-full rounded-xl ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`} />
            </article>
          ))}
        </div>
      ) : null}

      {!campaignsQuery.isLoading && campaignsQuery.isError ? (
        <section className={`rounded-2xl border p-5 ${cardClass}`}>
          <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>Could not load campaigns</h2>
          <p className={`mt-2 text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
            {extractApiErrorMessage(campaignsQuery.error, "Please refresh and try again.")}
          </p>
          <button
            type="button"
            onClick={() => campaignsQuery.refetch()}
            className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold ${
              isDark ? "bg-primary-900/50 text-primary-200 hover:bg-primary-900/70" : "bg-primary-950 text-white hover:bg-primary-900"
            }`}
          >
            Retry
          </button>
        </section>
      ) : null}

      {!campaignsQuery.isLoading && !campaignsQuery.isError && campaigns.length === 0 ? (
        <section className={`rounded-2xl border p-8 text-center ${cardClass}`}>
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>No campaigns yet</h2>
          <p className={`mt-2 text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
            Create your first campaign to start raising funds and tracking investor activity.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="mt-4 inline-flex rounded-xl bg-primary-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-900"
          >
            {t.createProject}
          </Link>
        </section>
      ) : null}

      {!campaignsQuery.isLoading && !campaignsQuery.isError && campaigns.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => {
              const progress = Math.min(Math.max(Math.round(campaign.fundingProgress ?? 0), 0), 100);
              return (
                <article key={campaign.id} className={`overflow-hidden rounded-2xl border ${cardClass}`}>
                  {campaign.heroImageUrl ? (
                    <img src={campaign.heroImageUrl} alt={campaign.title} className="h-40 w-full object-cover" />
                  ) : (
                    <div
                      className={`flex h-40 w-full items-center justify-center text-sm font-medium ${
                        isDark ? "bg-zinc-900 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      No image
                    </div>
                  )}
                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className={`line-clamp-2 font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{campaign.title}</h2>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isDark ? "bg-white/10 text-zinc-300" : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    <p className={`line-clamp-2 text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{campaign.shortDescription}</p>
                    <div className={`h-2 overflow-hidden rounded-full ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`}>
                      <div className="h-full rounded-full bg-gradient-to-r from-primary-950 to-primary-600" style={{ width: `${progress}%` }} />
                    </div>
                    <div className={`grid grid-cols-2 gap-3 text-xs ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                      <div>
                        <p className="opacity-80">Raised</p>
                        <p className="text-sm font-semibold">{formatCurrency(campaign.amountRaised)}</p>
                      </div>
                      <div>
                        <p className="opacity-80">Goal</p>
                        <p className="text-sm font-semibold">{formatCurrency(campaign.fundingGoal)}</p>
                      </div>
                      <div>
                        <p className="opacity-80">Investors</p>
                        <p className="text-sm font-semibold">{campaign.totalInvestors ?? 0}</p>
                      </div>
                      <div>
                        <p className="opacity-80">Ends</p>
                        <p className="text-sm font-semibold">{formatDate(campaign.endDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold ${isDark ? "text-primary-200" : "text-primary-900"}`}>{progress}% funded</p>
                      <Link
                        href={`/dashboard/campaigns/${campaign.id}`}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                          isDark ? "bg-primary-900/50 text-primary-200 hover:bg-primary-900/70" : "bg-primary-950 text-white hover:bg-primary-900"
                        }`}
                      >
                        {t.manageProject}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <DashboardPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} isDark={isDark} />
        </>
      ) : null}
    </div>
  );
}
