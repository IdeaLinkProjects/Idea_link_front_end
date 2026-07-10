import Head from "next/head";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { InvestorInvestmentsTable } from "@/components/dashboard/investor/InvestorInvestmentsTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { formatEtb } from "@/lib/format/formatEtb";
import { messages } from "@/locales";
import {
  useCancelPendingInvestmentMutation,
  useGetUserInvestmentsPageQuery,
  useLazyGetInvestmentByIdQuery,
} from "@/store";

const PAGE_SIZE = 10;

function formatDate(iso: string | null | undefined, locale: "en" | "am"): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "am" ? "am-ET" : "en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function InvestorInvestmentPage() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].investorDashboard;
  const commonT = messages[locale].commonDashboard;
  const [page, setPage] = useState(0);
  const [activeInvestmentId, setActiveInvestmentId] = useState<number | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  const listQuery = useGetUserInvestmentsPageQuery({ page, size: PAGE_SIZE });
  const [loadInvestmentDetail, detailQuery] = useLazyGetInvestmentByIdQuery();
  const [cancelPendingInvestment, cancelState] = useCancelPendingInvestmentMutation();

  const rows = listQuery.data?.content ?? [];
  const totalPages = listQuery.data?.totalPages ?? 0;
  const isFirst = page <= 0;
  const isLast = totalPages === 0 ? true : page >= totalPages - 1;

  const cardClass = isDark ? "border-white/15 bg-white/10" : "border-zinc-200 bg-white";
  const modalClass = isDark
    ? "border-white/15 bg-zinc-900 text-zinc-100 shadow-2xl shadow-black/50"
    : "border-zinc-200 bg-white text-zinc-900 shadow-2xl shadow-zinc-300/60";
  const tableText = {
    campaign: t.investmentTableCampaign,
    amount: t.investmentTableAmount,
    shares: t.investmentTableShares,
    status: t.investmentTableStatus,
    invested: t.investmentTableInvested,
    coolingOff: t.investmentTableCoolingOff,
    actions: t.investmentTableActions,
    detail: t.investmentActionDetail,
    cancel: t.investmentActionCancel,
    empty: t.investmentTableEmpty,
  };

  async function openDetail(investmentId: number) {
    setActionError("");
    setActiveInvestmentId(investmentId);
    try {
      await loadInvestmentDetail(investmentId).unwrap();
    } catch (err) {
      setActionError(extractApiErrorMessage(err, "Could not load investment details."));
    }
  }

  async function onCancelConfirmed() {
    if (confirmCancelId == null) return;
    setActionError("");
    try {
      await cancelPendingInvestment(confirmCancelId).unwrap();
      setConfirmCancelId(null);
      await listQuery.refetch();
    } catch (err) {
      setActionError(extractApiErrorMessage(err, "Could not cancel this investment."));
      setConfirmCancelId(null);
    }
  }

  return (
    <>
      <Head>
        <title>{`${commonT.navInvestment} | IdealLink`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <DashboardLayout>
        <section className="mx-auto w-full max-w-7xl space-y-4">
          <DashboardPageHeader title={commonT.navInvestment} subtitle={t.portfolioPageSubtitle} />

          {actionError ? (
            <p className={`rounded-xl border px-4 py-3 text-sm ${isDark ? "border-red-500/40 bg-red-500/10 text-red-200" : "border-red-200 bg-red-50 text-red-700"}`}>
              {actionError}
            </p>
          ) : null}

          <div className={`overflow-x-auto rounded-2xl border ${cardClass}`}>
            <InvestorInvestmentsTable
              rows={rows}
              isDark={isDark}
              locale={locale}
              isLoading={listQuery.isLoading}
              text={tableText}
              onOpenDetail={(investmentId) => void openDetail(investmentId)}
              onCancel={(investmentId) => setConfirmCancelId(investmentId)}
              formatDate={(iso) => formatDate(iso, locale)}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={isFirst}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold ${isDark ? "border-white/20 text-zinc-200 disabled:opacity-40" : "border-zinc-300 text-zinc-700 disabled:opacity-40"}`}
            >
              {t.paginationPrevious}
            </button>
            <span className={`text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{totalPages === 0 ? "0 / 0" : `${page + 1} / ${totalPages}`}</span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={isLast}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold ${isDark ? "border-white/20 text-zinc-200 disabled:opacity-40" : "border-zinc-300 text-zinc-700 disabled:opacity-40"}`}
            >
              {t.paginationNext}
            </button>
          </div>
        </section>

        {activeInvestmentId != null ? (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
            role="presentation"
            onClick={() => setActiveInvestmentId(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              className={`w-full max-w-3xl rounded-2xl border p-5 ${modalClass}`}
              onClick={(e) => e.stopPropagation()}
            >
              {detailQuery.isFetching || !detailQuery.data ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold">Investment detail</h2>
                  <p className={isDark ? "text-zinc-300" : "text-zinc-600"}>Loading details...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold">Investment detail #{detailQuery.data.id}</h2>
                    <button
                      type="button"
                      onClick={() => setActiveInvestmentId(null)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${isDark ? "border-white/20 text-zinc-100 hover:bg-white/10" : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"}`}
                    >
                      Close
                    </button>
                  </div>
                  <div className={`mt-3 grid gap-2 text-sm sm:grid-cols-2 ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
                    <p>Campaign: {detailQuery.data.campaign.title}</p>
                    <p>Status: {detailQuery.data.status}</p>
                    <p>Amount: {formatEtb(detailQuery.data.amount, locale)} ETB</p>
                    <p>Shares: {detailQuery.data.sharesPurchased.toLocaleString()}</p>
                    <p>Equity: {detailQuery.data.equityPercentage}%</p>
                    <p>Share price: {formatEtb(detailQuery.data.sharePriceAtPurchase, locale)} ETB</p>
                    <p>Invested: {formatDate(detailQuery.data.investmentDate, locale)}</p>
                    <p>Completed: {formatDate(detailQuery.data.completedDate, locale)}</p>
                    <p>Cooling-off expiry: {formatDate(detailQuery.data.coolingOffExpiry, locale)}</p>
                    <p>Withdrawal eligible: {detailQuery.data.withdrawalEligible ? "Yes" : "No"}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}

        <ConfirmDialog
          open={confirmCancelId != null}
          title="Cancel pending investment?"
          description="This action will cancel the selected pending investment."
          cancelLabel="Keep"
          confirmLabel="Cancel investment"
          submittingLabel="Cancelling..."
          onCancel={() => setConfirmCancelId(null)}
          onConfirm={() => void onCancelConfirmed()}
          isDark={isDark}
          variant="danger"
          isSubmitting={cancelState.isLoading}
        />
      </DashboardLayout>
    </>
  );
}
