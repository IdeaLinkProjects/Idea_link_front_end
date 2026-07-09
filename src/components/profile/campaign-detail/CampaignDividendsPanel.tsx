import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { campaignStatusVariant, StatusBadge } from "@/components/dashboard/innovator/dashboardUi";
import { formatCurrency } from "@/components/dashboard/innovator/format";
import { isCompletedCampaignStatus } from "@/lib/campaign/isCompletedCampaignStatus";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages, type Locale } from "@/locales";
import type { CampaignDividend, DividendAllocation, DividendPreviewResponse } from "@/store";
import {
  useCancelCampaignDividendMutation,
  useCreateCampaignDividendMutation,
  useExecuteCampaignDividendMutation,
  useGetCampaignDividendsQuery,
  useGetMyCampaignsQuery,
  usePreviewCampaignDividendMutation,
} from "@/store";

type DividendsCopy = (typeof messages)["en"]["campaignDetailPage"]["dividends"];

function formatDateTime(iso: string, locale: Locale): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString(locale === "am" ? "am-ET" : "en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function canExecuteDividend(status: string): boolean {
  const normalized = status.trim().toUpperCase();
  return normalized === "DECLARED" || normalized === "PENDING";
}

function canCancelDividend(status: string): boolean {
  const normalized = status.trim().toUpperCase();
  return normalized !== "EXECUTED" && normalized !== "CANCELLED" && normalized !== "CANCELED";
}

function allocationAmount(allocation: DividendAllocation): number {
  return allocation.dividendAmount ?? allocation.amount ?? 0;
}

function allocationInvestorLabel(allocation: DividendAllocation, fallback: string): string {
  return allocation.investorName?.trim() || allocation.investorEmail?.trim() || fallback;
}

type CampaignDividendsPanelProps = {
  defaultCampaignId: number;
  locale: Locale;
  isDark: boolean;
  t: DividendsCopy;
  errors: (typeof messages)["en"]["campaignDetailPage"]["errors"];
  cancelAction: string;
};

export function CampaignDividendsPanel({
  defaultCampaignId,
  locale,
  isDark,
  t,
  errors,
  cancelAction,
}: CampaignDividendsPanelProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(defaultCampaignId);
  const [totalAmount, setTotalAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState<DividendPreviewResponse | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [dividendToExecute, setDividendToExecute] = useState<CampaignDividend | null>(null);
  const [dividendToCancel, setDividendToCancel] = useState<CampaignDividend | null>(null);

  const campaignsQuery = useGetMyCampaignsQuery({ page: 0, size: 100 });
  const completedCampaigns = useMemo(
    () => (campaignsQuery.data?.content ?? []).filter((campaign) => isCompletedCampaignStatus(campaign.status)),
    [campaignsQuery.data?.content],
  );

  const activeCampaignId = selectedCampaignId ?? defaultCampaignId;

  const dividendsQuery = useGetCampaignDividendsQuery(activeCampaignId, {
    skip: !activeCampaignId,
  });

  const [previewDividend, { isLoading: isPreviewing }] = usePreviewCampaignDividendMutation();
  const [createDividend, { isLoading: isCreating }] = useCreateCampaignDividendMutation();
  const [executeDividend, { isLoading: isExecuting }] = useExecuteCampaignDividendMutation();
  const [cancelDividend, { isLoading: isCancelling }] = useCancelCampaignDividendMutation();

  const isFormBusy = isPreviewing || isCreating;

  useEffect(() => {
    setSelectedCampaignId(defaultCampaignId);
  }, [defaultCampaignId]);

  useEffect(() => {
    setPreview(null);
    setNotice(null);
  }, [activeCampaignId]);

  const cardClass = isDark
    ? "rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-950/90"
    : "rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-primary-50/30";

  const inputClass = `w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500/40 ${
    isDark ? "border-white/10 bg-black/25 text-zinc-100 placeholder:text-zinc-500" : "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400"
  }`;

  const labelClass = `mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`;

  const secondaryBtnClass = `rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
    isDark ? "border-white/15 text-zinc-100 hover:bg-white/10" : "border-zinc-300 text-zinc-800 hover:bg-zinc-100"
  }`;

  const primaryBtnClass = `rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
    isDark ? "bg-primary-600 hover:bg-primary-500" : "bg-primary-950 hover:bg-primary-900"
  }`;

  const dangerOutlineClass = `rounded-xl border px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
    isDark ? "border-red-500/50 text-red-200 hover:bg-red-500/10" : "border-red-300 text-red-700 hover:bg-red-50"
  }`;

  function parseFormAmount(): number | null {
    const parsed = Number.parseFloat(totalAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
  }

  function buildRequestBody() {
    const amount = parseFormAmount();
    if (amount == null) return null;
    return { totalAmount: amount, notes: notes.trim() };
  }

  async function handlePreview() {
    const body = buildRequestBody();
    if (!body || !activeCampaignId) {
      setNotice({ tone: "err", text: t.amountRequired });
      return;
    }

    setNotice(null);
    try {
      const result = await previewDividend({ campaignId: activeCampaignId, body }).unwrap();
      setPreview(result);
    } catch (err) {
      setPreview(null);
      setNotice({ tone: "err", text: extractApiErrorMessage(err, errors.previewDividendFailed) });
    }
  }

  async function handleDeclare() {
    const body = buildRequestBody();
    if (!body || !activeCampaignId) {
      setNotice({ tone: "err", text: t.amountRequired });
      return;
    }

    setNotice(null);
    try {
      await createDividend({ campaignId: activeCampaignId, body }).unwrap();
      setPreview(null);
      setTotalAmount("");
      setNotes("");
      setNotice({ tone: "ok", text: t.declareSuccess });
      await dividendsQuery.refetch();
    } catch (err) {
      setNotice({ tone: "err", text: extractApiErrorMessage(err, errors.declareDividendFailed) });
    }
  }

  async function handleExecuteConfirmed() {
    if (!dividendToExecute || !activeCampaignId) return;
    setNotice(null);
    try {
      await executeDividend({
        campaignId: activeCampaignId,
        dividendId: dividendToExecute.id,
      }).unwrap();
      setDividendToExecute(null);
      setNotice({ tone: "ok", text: t.executeSuccess });
      await dividendsQuery.refetch();
    } catch (err) {
      setNotice({ tone: "err", text: extractApiErrorMessage(err, errors.executeDividendFailed) });
      setDividendToExecute(null);
    }
  }

  async function handleCancelConfirmed() {
    if (!dividendToCancel || !activeCampaignId) return;
    setNotice(null);
    try {
      await cancelDividend({
        campaignId: activeCampaignId,
        dividendId: dividendToCancel.id,
      }).unwrap();
      setDividendToCancel(null);
      setNotice({ tone: "ok", text: t.cancelSuccess });
      await dividendsQuery.refetch();
    } catch (err) {
      setNotice({ tone: "err", text: extractApiErrorMessage(err, errors.cancelDividendFailed) });
      setDividendToCancel(null);
    }
  }

  const dividends = dividendsQuery.data ?? [];
  const showCampaignLoading = campaignsQuery.isLoading || campaignsQuery.isFetching;
  const showDividendsLoading = dividendsQuery.isLoading || (dividendsQuery.isFetching && !dividendsQuery.data);

  return (
    <div className="space-y-5">
      {notice ? (
        <div
          role="status"
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            notice.tone === "ok"
              ? isDark
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
              : isDark
                ? "border-red-500/40 bg-red-500/10 text-red-200"
                : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      <section className={`${cardClass} p-5 sm:p-6`}>
        <div className="mb-5">
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.title}</h2>
          <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.subtitle}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="dividend-campaign-select" className={labelClass}>
              {t.selectCampaign}
            </label>
            {showCampaignLoading ? (
              <div className={`h-10 animate-pulse rounded-xl ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
            ) : completedCampaigns.length === 0 ? (
              <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.noCompletedCampaigns}</p>
            ) : (
              <select
                id="dividend-campaign-select"
                value={activeCampaignId}
                onChange={(event) => setSelectedCampaignId(Number(event.target.value))}
                className={inputClass}
              >
                {completedCampaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {completedCampaigns.length > 0 ? (
            <>
              <div>
                <label htmlFor="dividend-total-amount" className={labelClass}>
                  {t.totalAmount}
                </label>
                <input
                  id="dividend-total-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={totalAmount}
                  onChange={(event) => setTotalAmount(event.target.value)}
                  placeholder={t.totalAmountPlaceholder}
                  className={inputClass}
                  disabled={isFormBusy}
                />
              </div>

              <div>
                <label htmlFor="dividend-notes" className={labelClass}>
                  {t.notes}
                </label>
                <textarea
                  id="dividend-notes"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t.notesPlaceholder}
                  className={`${inputClass} resize-y`}
                  disabled={isFormBusy}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handlePreview()}
                  disabled={isFormBusy || !activeCampaignId}
                  className={secondaryBtnClass}
                >
                  {isPreviewing ? t.previewing : t.preview}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeclare()}
                  disabled={isFormBusy || !activeCampaignId}
                  className={primaryBtnClass}
                >
                  {isCreating ? t.declaring : t.declare}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {preview ? (
        <section className={`${cardClass} p-5 sm:p-6`}>
          <div className="mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.previewTitle}</h3>
            <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              {t.previewSubtitle.replace("{amount}", formatCurrency(preview.totalAmount, locale)).replace(
                "{count}",
                String(preview.totalInvestors ?? preview.allocations.length),
              )}
            </p>
          </div>

          {preview.allocations.length === 0 ? (
            <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.previewEmpty}</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className={`${isDark ? "bg-zinc-900/90" : "bg-zinc-50"} border-b ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">{t.table.investor}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">{t.table.investmentAmount}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">{t.table.equityPercentage}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-right">{t.table.dividendAmount}</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.allocations.map((allocation, index) => (
                    <tr
                      key={allocation.investorId ?? `${allocation.investorName ?? "investor"}-${index}`}
                      className={`border-b last:border-b-0 ${isDark ? "border-white/10" : "border-zinc-200"}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {allocationInvestorLabel(allocation, t.table.anonymousInvestor)}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {allocation.investmentAmount != null
                          ? formatCurrency(allocation.investmentAmount, locale)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {allocation.equityPercentage != null ? `${allocation.equityPercentage.toFixed(2)}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">
                        {formatCurrency(allocationAmount(allocation), locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      <section className={`${cardClass} p-5 sm:p-6`}>
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.historyTitle}</h3>
          <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.historySubtitle}</p>
        </div>

        {showDividendsLoading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={`h-10 rounded-lg ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`} />
            ))}
          </div>
        ) : dividendsQuery.isError ? (
          <div className="space-y-3">
            <p className={`text-sm ${isDark ? "text-red-300" : "text-red-700"}`}>
              {extractApiErrorMessage(dividendsQuery.error, errors.loadDividendsFailed)}
            </p>
            <button type="button" onClick={() => void dividendsQuery.refetch()} className={secondaryBtnClass}>
              {t.retry}
            </button>
          </div>
        ) : dividends.length === 0 ? (
          <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.historyEmpty}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className={`${isDark ? "bg-zinc-900/90" : "bg-zinc-50"} border-b ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">{t.table.id}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">{t.table.amount}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">{t.table.status}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">{t.table.notes}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">{t.table.createdAt}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-right">{t.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {dividends.map((dividend) => {
                  const showExecute = canExecuteDividend(dividend.status);
                  const showCancel = canCancelDividend(dividend.status);
                  const isRowBusy =
                    (isExecuting && dividendToExecute?.id === dividend.id) ||
                    (isCancelling && dividendToCancel?.id === dividend.id);

                  return (
                    <tr key={dividend.id} className={`border-b last:border-b-0 ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                      <td className="px-4 py-3 font-medium tabular-nums">#{dividend.id}</td>
                      <td className="px-4 py-3 tabular-nums">{formatCurrency(dividend.totalAmount, locale)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={dividend.status} variant={campaignStatusVariant(dividend.status)} isDark={isDark} />
                      </td>
                      <td className="max-w-[200px] px-4 py-3">
                        <span className="line-clamp-2">{dividend.notes?.trim() || "—"}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{formatDateTime(dividend.createdAt, locale)}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {showExecute ? (
                            <button
                              type="button"
                              onClick={() => setDividendToExecute(dividend)}
                              disabled={isRowBusy || isExecuting || isCancelling}
                              className={`rounded-xl px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                                isDark ? "bg-emerald-600 hover:bg-emerald-500" : "bg-emerald-600 hover:bg-emerald-700"
                              }`}
                            >
                              {t.execute}
                            </button>
                          ) : null}
                          {showCancel ? (
                            <button
                              type="button"
                              onClick={() => setDividendToCancel(dividend)}
                              disabled={isRowBusy || isExecuting || isCancelling}
                              className={dangerOutlineClass}
                            >
                              {t.cancel}
                            </button>
                          ) : null}
                          {!showExecute && !showCancel ? (
                            <span className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>—</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={dividendToExecute != null}
        title={t.confirmExecuteTitle}
        description={t.confirmExecuteBody}
        cancelLabel={cancelAction}
        confirmLabel={t.execute}
        submittingLabel={t.executing}
        onCancel={() => setDividendToExecute(null)}
        onConfirm={() => void handleExecuteConfirmed()}
        isDark={isDark}
        variant="neutral"
        isSubmitting={isExecuting}
      >
        {dividendToExecute ? (
          <p className={`text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
            {t.confirmExecuteAmount.replace("{amount}", formatCurrency(dividendToExecute.totalAmount, locale))}
          </p>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={dividendToCancel != null}
        title={t.confirmCancelTitle}
        description={t.confirmCancelBody}
        cancelLabel={cancelAction}
        confirmLabel={t.cancel}
        submittingLabel={t.cancelling}
        onCancel={() => setDividendToCancel(null)}
        onConfirm={() => void handleCancelConfirmed()}
        isDark={isDark}
        variant="danger"
        isSubmitting={isCancelling}
      >
        {dividendToCancel ? (
          <p className={`text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
            {t.confirmCancelAmount.replace("{amount}", formatCurrency(dividendToCancel.totalAmount, locale))}
          </p>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
