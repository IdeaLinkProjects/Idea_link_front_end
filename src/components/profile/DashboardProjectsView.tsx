import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardPagination } from "@/components/ui/DashboardPagination";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import { useGetMyCampaignsQuery, useGetUserInvestmentsQuery } from "@/store";

const PAGE_SIZE = 6;

function formatCurrency(value: number, locale: "en" | "am") {
  return new Intl.NumberFormat(locale === "am" ? "am-ET" : "en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(isoDate: string, locale: "en" | "am") {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString(locale === "am" ? "am-ET" : "en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DashboardProjectsView() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].innovatorDashboard;
  const [view, setView] = useState<"myCampaigns" | "investedCampaigns">("myCampaigns");
  const [myCampaignsPage, setMyCampaignsPage] = useState(0);
  const [investmentsPage, setInvestmentsPage] = useState(0);

  const myCampaignsRequest = useMemo(
    () => ({
      page: myCampaignsPage,
      size: PAGE_SIZE,
    }),
    [myCampaignsPage],
  );
  const investmentsRequest = useMemo(
    () => ({
      page: investmentsPage,
      size: PAGE_SIZE,
    }),
    [investmentsPage],
  );

  const campaignsQuery = useGetMyCampaignsQuery(myCampaignsRequest, { skip: view !== "myCampaigns" });
  const investmentsQuery = useGetUserInvestmentsQuery(investmentsRequest, { skip: view !== "investedCampaigns" });

  const campaigns = campaignsQuery.data?.content ?? [];
  const campaignsTotalPages = campaignsQuery.data?.totalPages ?? 0;
  const investments = investmentsQuery.data?.content ?? [];
  const investmentsTotalPages = investmentsQuery.data?.totalPages ?? 0;

  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";
  const selectedViewCard = isDark
    ? "border-primary-400/50 bg-gradient-to-br from-primary-950/55 via-primary-900/35 to-emerald-900/20 text-white"
    : "border-primary-300 bg-gradient-to-br from-primary-50 via-white to-emerald-50 text-zinc-900";
  const idleViewCard = isDark
    ? "border-white/15 bg-zinc-900/40 text-zinc-200 hover:border-primary-500/30 hover:bg-zinc-900/70"
    : "border-zinc-200 bg-white text-zinc-700 hover:border-primary-200 hover:bg-primary-50/40";

  const showMyCampaigns = view === "myCampaigns";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DashboardPageHeader
        title={t.campaignsPageTitle}
        subtitle={t.campaignsPageSubtitle}
        actions={
          showMyCampaigns ? (
            <Link
              href="/dashboard/projects/new"
              className="inline-flex justify-center rounded-xl bg-primary-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-primary-900"
            >
              {t.createProject}
            </Link>
          ) : null
        }
      />

      <section className={`rounded-3xl border p-4 sm:p-5 ${cardClass}`}>
        <div className="mb-4">
          <h2 className={`text-sm font-bold uppercase tracking-wide ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{t.campaignViewChooserTitle}</h2>
          <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.campaignViewChooserSubtitle}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setView("myCampaigns")}
            className={`rounded-2xl border p-4 text-left transition ${showMyCampaigns ? selectedViewCard : idleViewCard}`}
          >
            <p className="text-xs font-bold uppercase tracking-wide">{t.myCampaignsOptionBadge}</p>
            <p className="mt-1 text-base font-semibold">{t.myCampaignsOptionTitle}</p>
            <p className={`mt-1 text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{t.myCampaignsOptionDescription}</p>
          </button>
          <button
            type="button"
            onClick={() => setView("investedCampaigns")}
            className={`rounded-2xl border p-4 text-left transition ${!showMyCampaigns ? selectedViewCard : idleViewCard}`}
          >
            <p className="text-xs font-bold uppercase tracking-wide">{t.investedCampaignsOptionBadge}</p>
            <p className="mt-1 text-base font-semibold">{t.investedCampaignsOptionTitle}</p>
            <p className={`mt-1 text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{t.investedCampaignsOptionDescription}</p>
          </button>
        </div>
      </section>

      {showMyCampaigns && (campaignsQuery.isLoading || campaignsQuery.isFetching) ? (
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

      {!showMyCampaigns && (investmentsQuery.isLoading || investmentsQuery.isFetching) ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <article key={idx} className={`animate-pulse rounded-2xl border p-5 ${cardClass}`}>
              <div className={`h-5 w-2/3 rounded ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`} />
              <div className={`mt-3 h-3 w-full rounded ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`} />
              <div className={`mt-2 h-3 w-3/4 rounded ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`} />
              <div className={`mt-5 h-10 w-full rounded-xl ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`} />
            </article>
          ))}
        </div>
      ) : null}

      {showMyCampaigns && !campaignsQuery.isLoading && campaignsQuery.isError ? (
        <section className={`rounded-2xl border p-5 ${cardClass}`}>
          <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.errors.loadMyCampaignsTitle}</h2>
          <p className={`mt-2 text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
            {extractApiErrorMessage(campaignsQuery.error, t.errors.loadMyCampaignsDescription)}
          </p>
          <button
            type="button"
            onClick={() => campaignsQuery.refetch()}
            className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold ${
              isDark ? "bg-primary-900/50 text-primary-200 hover:bg-primary-900/70" : "bg-primary-950 text-white hover:bg-primary-900"
            }`}
          >
            {t.retry}
          </button>
        </section>
      ) : null}

      {!showMyCampaigns && !investmentsQuery.isLoading && investmentsQuery.isError ? (
        <section className={`rounded-2xl border p-5 ${cardClass}`}>
          <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.errors.loadInvestmentsTitle}</h2>
          <p className={`mt-2 text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
            {extractApiErrorMessage(investmentsQuery.error, t.errors.loadInvestmentsDescription)}
          </p>
          <button
            type="button"
            onClick={() => investmentsQuery.refetch()}
            className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold ${
              isDark ? "bg-primary-900/50 text-primary-200 hover:bg-primary-900/70" : "bg-primary-950 text-white hover:bg-primary-900"
            }`}
          >
            {t.retry}
          </button>
        </section>
      ) : null}

      {showMyCampaigns && !campaignsQuery.isLoading && !campaignsQuery.isError && campaigns.length === 0 ? (
        <section className={`rounded-2xl border p-8 text-center ${cardClass}`}>
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.emptyMyCampaignsTitle}</h2>
          <p className={`mt-2 text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
            {t.emptyMyCampaignsDescription}
          </p>
          <Link
            href="/dashboard/projects/new"
            className="mt-4 inline-flex rounded-xl bg-primary-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-900"
          >
            {t.createProject}
          </Link>
        </section>
      ) : null}

      {!showMyCampaigns && !investmentsQuery.isLoading && !investmentsQuery.isError && investments.length === 0 ? (
        <section className={`rounded-2xl border p-8 text-center ${cardClass}`}>
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.emptyInvestmentsTitle}</h2>
          <p className={`mt-2 text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{t.emptyInvestmentsDescription}</p>
        </section>
      ) : null}

      {showMyCampaigns && !campaignsQuery.isLoading && !campaignsQuery.isError && campaigns.length > 0 ? (
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
                        <p className="opacity-80">{t.raisedLabel}</p>
                        <p className="text-sm font-semibold">{formatCurrency(campaign.amountRaised, locale)}</p>
                      </div>
                      <div>
                        <p className="opacity-80">{t.goalLabel}</p>
                        <p className="text-sm font-semibold">{formatCurrency(campaign.fundingGoal, locale)}</p>
                      </div>
                      <div>
                        <p className="opacity-80">{t.investorsLabel}</p>
                        <p className="text-sm font-semibold">{campaign.totalInvestors ?? 0}</p>
                      </div>
                      <div>
                        <p className="opacity-80">{t.endsLabel}</p>
                        <p className="text-sm font-semibold">{formatDate(campaign.endDate, locale)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold ${isDark ? "text-primary-200" : "text-primary-900"}`}>{t.fundedPercentLabel.replace("{pct}", String(progress))}</p>
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

          <DashboardPagination
            currentPage={myCampaignsPage}
            totalPages={campaignsTotalPages}
            onPageChange={setMyCampaignsPage}
            isDark={isDark}
            previousLabel={t.paginationPrevious}
            nextLabel={t.paginationNext}
          />
        </>
      ) : null}

      {!showMyCampaigns && !investmentsQuery.isLoading && !investmentsQuery.isError && investments.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {investments.map((investment) => (
              <article key={investment.id} className={`overflow-hidden rounded-2xl border ${cardClass}`}>
                {investment.campaign?.heroImageUrl ? (
                  <img src={investment.campaign.heroImageUrl} alt={investment.campaign.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className={`flex h-40 w-full items-center justify-center text-sm font-medium ${isDark ? "bg-zinc-900 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}>
                    {t.noImage}
                  </div>
                )}
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className={`line-clamp-2 font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{investment.campaign.title}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-800"}`}>
                      {investment.status}
                    </span>
                  </div>
                  <p className={`line-clamp-1 text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                    {t.companyLabel}: {investment.campaign.company?.name ?? "—"}
                  </p>
                  <div className={`grid grid-cols-2 gap-3 text-xs ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                    <div>
                      <p className="opacity-80">{t.investedAmountLabel}</p>
                      <p className="text-sm font-semibold">{formatCurrency(investment.amount, locale)}</p>
                    </div>
                    <div>
                      <p className="opacity-80">{t.netAmountLabel}</p>
                      <p className="text-sm font-semibold">{formatCurrency(investment.netAmount, locale)}</p>
                    </div>
                    <div>
                      <p className="opacity-80">{t.equityLabel}</p>
                      <p className="text-sm font-semibold">{investment.equityPercentage}%</p>
                    </div>
                    <div>
                      <p className="opacity-80">{t.investmentDateLabel}</p>
                      <p className="text-sm font-semibold">{formatDate(investment.investmentDate, locale)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                      {t.paymentStatusLabel}: {investment.payment?.paymentStatus ?? "—"}
                    </p>
                    <Link
                      href={`/projects/${investment.campaign.id}?from=investments`}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        isDark ? "bg-primary-900/50 text-primary-200 hover:bg-primary-900/70" : "bg-primary-950 text-white hover:bg-primary-900"
                      }`}
                    >
                      {t.viewCampaignCta}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <DashboardPagination
            currentPage={investmentsPage}
            totalPages={investmentsTotalPages}
            onPageChange={setInvestmentsPage}
            isDark={isDark}
            previousLabel={t.paginationPrevious}
            nextLabel={t.paginationNext}
          />
        </>
      ) : null}
    </div>
  );
}
