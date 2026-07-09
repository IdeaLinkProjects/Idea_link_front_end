import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import type { CampaignDetailTabKey } from "@/components/profile/campaign-detail/CampaignTabsNav";
import { CampaignTabsNav } from "@/components/profile/campaign-detail/CampaignTabsNav";
import { CampaignDividendsPanel } from "@/components/profile/campaign-detail/CampaignDividendsPanel";
import { CampaignUpdatesPanel } from "@/components/profile/campaign-detail/CampaignUpdatesPanel";
import { isCompletedCampaignStatus } from "@/lib/campaign/isCompletedCampaignStatus";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { KYC_STATUS, resolveAccountKycStatus } from "@/constants/kycStatus";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import type { CampaignDocument } from "@/store";
import {
  useDeleteCampaignDocumentMutation,
  useDeleteCampaignMutation,
  useGetCampaignByIdQuery,
  useGetUserRolesStatusQuery,
  useLazyGetCampaignDocumentByIdQuery,
  useSubmitCampaignMutation,
} from "@/store";

type CampaignDetailViewProps = {
  campaignId: number;
};

function normalizeStatus(status: string) {
  return status.trim().toLowerCase();
}

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

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function toKeyValueEntries(input: unknown): Array<[string, string]> {
  if (!input) return [];
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input) as Record<string, string>;
      return Object.entries(parsed);
    } catch {
      return [];
    }
  }
  if (typeof input === "object") {
    return Object.entries(input as Record<string, string>);
  }
  return [];
}

function metricCardClass(isDark: boolean) {
  return isDark
    ? "rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-md"
    : "rounded-2xl border border-zinc-200 bg-white p-4 shadow-md";
}

function statusBadgeClass(status: string, isDark: boolean) {
  const value = status.toLowerCase();
  if (value.includes("active") || value.includes("live")) {
    return isDark
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (value.includes("draft") || value.includes("pending")) {
    return isDark
      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
      : "bg-amber-100 text-amber-700 border-amber-200";
  }
  return isDark ? "bg-zinc-500/20 text-zinc-300 border-zinc-500/40" : "bg-zinc-100 text-zinc-700 border-zinc-200";
}

function verificationBadgeClass(status: string, isDark: boolean) {
  const value = status.toLowerCase();
  if (value.includes("verified") || value.includes("approved")) {
    return isDark
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (value.includes("rejected")) {
    return isDark ? "bg-red-500/20 text-red-300 border-red-500/40" : "bg-red-100 text-red-700 border-red-200";
  }
  return isDark ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-amber-100 text-amber-700 border-amber-200";
}

export function CampaignDetailView({ campaignId }: CampaignDetailViewProps) {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].campaignDetailPage;
  const query = useGetCampaignByIdQuery(campaignId);
  const { data: userRolesStatus } = useGetUserRolesStatusQuery();
  const [deleteCampaign, { isLoading: deletingCampaign }] = useDeleteCampaignMutation();
  const [deleteDocument, { isLoading: deletingDocument }] = useDeleteCampaignDocumentMutation();
  const [fetchDocumentById] = useLazyGetCampaignDocumentByIdQuery();
  const [submitCampaign, { isLoading: isSubmittingCampaign }] = useSubmitCampaignMutation();

  const [activeTab, setActiveTab] = useState<CampaignDetailTabKey>("overview");
  const [campaignDeleteOpen, setCampaignDeleteOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<CampaignDocument | null>(null);
  const [openingDocumentId, setOpeningDocumentId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const cardClass = isDark
    ? "rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-950/90"
    : "rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-primary-50/30";

  const campaign = query.data;
  const storyEntries = useMemo(() => toKeyValueEntries(campaign?.storyJson), [campaign?.storyJson]);
  const risksEntries = useMemo(() => toKeyValueEntries(campaign?.risksJson), [campaign?.risksJson]);

  const isDraft = campaign ? normalizeStatus(campaign.status) === "draft" : false;
  const isCompleted = campaign ? isCompletedCampaignStatus(campaign.status) : false;
  const accountKycStatus = resolveAccountKycStatus(
    userRolesStatus?.innovatorPrerequisites?.kycStatus,
    userRolesStatus?.investorPrerequisites?.kycStatus,
  );
  const canSubmitCampaign = accountKycStatus === KYC_STATUS.VERIFIED;
  const hasInvestors = (campaign?.totalInvestors ?? 0) > 0;
  const canDeleteCampaign = isDraft && !hasInvestors;

  async function handleSubmitCampaign() {
    if (!campaign || !isDraft) return;
    setNotice(null);
    try {
      await submitCampaign({ campaignId: campaign.id }).unwrap();
      setNotice({ tone: "ok", text: t.submitCampaignSuccess });
      await query.refetch();
    } catch (err) {
      setNotice({ tone: "err", text: extractApiErrorMessage(err, t.errors.submitCampaignFailed) });
    }
  }

  async function handleDeleteCampaignConfirmed() {
    if (!campaign) return;
    setNotice(null);
    try {
      await deleteCampaign(campaign.id).unwrap();
      setCampaignDeleteOpen(false);
      setNotice({ tone: "ok", text: t.campaignDeletedRedirect });
      await router.push("/dashboard/projects");
    } catch (err) {
      setNotice({ tone: "err", text: extractApiErrorMessage(err, t.errors.deleteCampaignFailed) });
      setCampaignDeleteOpen(false);
    }
  }

  async function handleDeleteDocumentConfirmed() {
    if (!campaign || !documentToDelete) return;
    setNotice(null);
    try {
      await deleteDocument({ campaignId: campaign.id, documentId: documentToDelete.id }).unwrap();
      setDocumentToDelete(null);
      setNotice({ tone: "ok", text: t.documentDeleted });
      window.setTimeout(() => setNotice(null), 4000);
    } catch (err) {
      setNotice({ tone: "err", text: extractApiErrorMessage(err, t.errors.deleteDocumentFailed) });
      setDocumentToDelete(null);
    }
  }

  async function handleOpenDocument(docId: number) {
    if (!campaign) return;
    setNotice(null);
    setOpeningDocumentId(docId);
    try {
      const d = await fetchDocumentById({ campaignId: campaign.id, documentId: docId }).unwrap();
      const url = d.documentUrl?.trim();
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        setNotice({ tone: "err", text: t.errors.openDocumentNoUrl });
      }
    } catch (err) {
      setNotice({ tone: "err", text: extractApiErrorMessage(err, t.errors.openDocumentFailed) });
    } finally {
      setOpeningDocumentId(null);
    }
  }

  if (query.isLoading || query.isFetching) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-4">
        <div className={`h-12 rounded-2xl ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
        <div className={`h-56 rounded-3xl ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
      </div>
    );
  }

  if (query.isError || !campaign) {
    return (
      <section className={`${cardClass} mx-auto max-w-3xl p-6`}>
        <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.loadFailed}</h2>
        <p className={`mt-2 text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{extractApiErrorMessage(query.error, t.retryMessage)}</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => query.refetch()}
            className="rounded-xl bg-primary-950 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900"
          >
            {t.retry}
          </button>
          <Link
            href="/dashboard/projects"
            className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
              isDark ? "border-zinc-600 text-zinc-200 hover:bg-white/10" : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {t.backToCampaigns}
          </Link>
        </div>
      </section>
    );
  }

  const progress = Math.min(Math.max(Math.round(campaign.fundingProgress ?? 0), 0), 100);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/projects"
          className={`text-sm font-semibold ${isDark ? "text-primary-400 hover:text-primary-300" : "text-primary-700 hover:text-primary-800"}`}
        >
          {t.backToCampaigns}
        </Link>
      </div>

      <CampaignTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showDividendsTab={isCompleted}
        labels={{
          overview: t.tabs.overview,
          files: t.tabs.files,
          updates: t.tabs.updates,
          dividends: t.tabs.dividends,
          settings: t.tabs.settings,
        }}
      />

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

      {activeTab === "overview" ? (
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-3xl border border-white/10">
            {campaign.heroImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={campaign.heroImageUrl} alt={campaign.title} className="h-72 w-full object-cover sm:h-80" />
            ) : (
              <div className={`flex h-72 w-full items-center justify-center sm:h-80 ${isDark ? "bg-zinc-900 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}>
                {t.noHeroImage}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/15" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-3xl">
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">{campaign.title}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-zinc-100/90 sm:text-base">{campaign.shortDescription}</p>
                  <div className="mt-4 h-2.5 w-full max-w-xl overflow-hidden rounded-full bg-white/25">
                    <div className="h-full rounded-full bg-primary-400" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-primary-100">
                    {progress}% {t.progress}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/projects/${campaign.id}/documents`}
                    className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500"
                  >
                    {t.uploadDocs}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className={`${cardClass} p-5 sm:p-6`}>
            <h2 className={`mb-4 text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.fundingOverview}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                [t.fundingGoal, formatCurrency(campaign.fundingGoal, locale)],
                [t.amountRaised, formatCurrency(campaign.amountRaised, locale)],
                [t.equityOffered, `${campaign.equityOffered.toFixed(2)}%`],
                [t.valuation, formatCurrency(campaign.valuation, locale)],
                [t.minInvestment, formatCurrency(campaign.minInvestment, locale)],
                [t.progressPercent, `${progress}%`],
              ].map(([label, value]) => (
                <div key={label} className={metricCardClass(isDark)}>
                  <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{label}</p>
                  <p className={`mt-2 text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={`${cardClass} p-5 sm:p-6`}>
            <h2 className={`mb-4 text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.company}</h2>
            {campaign.company ? (
              <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-white/80"}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {campaign.company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={campaign.company.logoUrl} alt={campaign.company.name} className="h-16 w-16 rounded-xl object-cover" />
                  ) : (
                    <div className={`flex h-16 w-16 items-center justify-center rounded-xl text-sm ${isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}>
                      {t.noLogo}
                    </div>
                  )}
                  <div>
                    <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{campaign.company.name}</p>
                    <p className={`text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{campaign.company.industry}</p>
                  </div>
                </div>
                <p className={`mt-4 text-sm ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{campaign.company.description || "—"}</p>
                {campaign.company.website ? (
                  <a
                    href={campaign.company.website}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-3 inline-flex text-sm font-semibold ${isDark ? "text-primary-300 hover:text-primary-200" : "text-primary-700 hover:text-primary-800"}`}
                  >
                    {campaign.company.website}
                  </a>
                ) : null}
              </div>
            ) : (
              <p className={`text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{t.noCompanyInfo}</p>
            )}
          </section>

          <section className={`${cardClass} p-5 sm:p-6`}>
            <h2 className={`mb-4 text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.story}</h2>
            {storyEntries.length ? (
              <div className="space-y-3">
                {storyEntries.map(([key, value]) => (
                  <article key={key} className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-white/80"}`}>
                    <h3 className={`text-base font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{key}</h3>
                    <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{value}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{t.noStory}</p>
            )}
          </section>

          <section className={`${cardClass} p-5 sm:p-6`}>
            <h2 className={`mb-4 text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.risks}</h2>
            {risksEntries.length ? (
              <div className="space-y-3">
                {risksEntries.map(([key, value]) => (
                  <article key={key} className={`rounded-2xl border p-4 ${isDark ? "border-red-500/25 bg-red-500/10" : "border-amber-200 bg-amber-50"}`}>
                    <h3 className={`text-base font-semibold ${isDark ? "text-red-200" : "text-amber-900"}`}>{key}</h3>
                    <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-red-100/90" : "text-amber-800"}`}>{value}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{t.noRisks}</p>
            )}
          </section>

          <section className={`${cardClass} p-5 sm:p-6`}>
            <h2 className={`mb-4 text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.tags}</h2>
            {campaign.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {campaign.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{t.noTags}</p>
            )}
          </section>

          <section className={`${cardClass} p-5 sm:p-6`}>
            <h2 className={`mb-4 text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.timelineAndStatus}</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className={metricCardClass(isDark)}>
                <p className={`text-xs uppercase tracking-wide ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{t.startDate}</p>
                <p className={`mt-1 text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{formatDate(campaign.startDate, locale)}</p>
              </div>
              <div className={metricCardClass(isDark)}>
                <p className={`text-xs uppercase tracking-wide ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{t.endDate}</p>
                <p className={`mt-1 text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{formatDate(campaign.endDate, locale)}</p>
              </div>
              <div className={metricCardClass(isDark)}>
                <p className={`text-xs uppercase tracking-wide ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{t.status}</p>
                <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(campaign.status, isDark)}`}>{campaign.status}</span>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "updates" ? (
        <CampaignUpdatesPanel
          campaignId={campaign.id}
          locale={locale}
          isDark={isDark}
          t={t.updates}
          errors={t.errors}
          cancelAction={t.cancelAction}
          confirmDelete={t.confirmDelete}
          deleting={t.deleting}
        />
      ) : null}

      {activeTab === "dividends" && isCompleted ? (
        <CampaignDividendsPanel
          defaultCampaignId={campaign.id}
          locale={locale}
          isDark={isDark}
          t={t.dividends}
          errors={t.errors}
          cancelAction={t.cancelAction}
        />
      ) : null}

      {activeTab === "files" ? (
        <section className={`${cardClass} p-5 sm:p-6`}>
          <div className="mb-4">
            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.filesTabTitle}</h2>
            <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.filesTabSubtitle}</p>
          </div>

          {campaign.documents?.length ? (
            <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className={`${isDark ? "bg-zinc-900/90" : "bg-zinc-50"} border-b ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">{t.table.documentName}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">{t.table.documentType}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">{t.table.fileSize}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">{t.table.verificationStatus}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-right">{t.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {campaign.documents.map((doc) => {
                    const disableDeleteDoc = !isDraft;
                    const isOpeningThisDoc = openingDocumentId === doc.id;
                    return (
                      <tr key={doc.id} className={`border-b last:border-b-0 ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                        <td className="max-w-[200px] px-4 py-3 font-medium">
                          <span className="line-clamp-2">{doc.documentName || t.untitledDocument}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">{doc.documentType}</td>
                        <td className="whitespace-nowrap px-4 py-3">{formatFileSize(doc.fileSize)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${verificationBadgeClass(doc.verificationStatus, isDark)}`}>
                            {doc.verificationStatus}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void handleOpenDocument(doc.id)}
                              disabled={isOpeningThisDoc}
                              className="rounded-xl bg-primary-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isOpeningThisDoc ? t.table.openingDocument : t.table.view}
                            </button>
                            {disableDeleteDoc ? (
                              <span title={t.draftOnlyDocumentTooltip} className="inline-flex">
                                <button
                                  type="button"
                                  disabled
                                  className="cursor-not-allowed rounded-xl border border-red-500/35 px-3 py-1.5 text-xs font-semibold text-red-300 opacity-45 dark:text-red-200"
                                >
                                  {t.table.delete}
                                </button>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDocumentToDelete(doc)}
                                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                                  isDark ? "border-red-500/50 text-red-200 hover:bg-red-500/10" : "border-red-300 text-red-700 hover:bg-red-50"
                                }`}
                              >
                                {t.table.delete}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={`text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{t.noDocuments}</p>
          )}
        </section>
      ) : null}

      {activeTab === "settings" ? (
        <section className={`${cardClass} space-y-4 p-5 sm:p-6`}>
          <div>
            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.settingsTabTitle}</h2>
            <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.settingsTabSubtitle}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {isDraft ? (
              <Link
                href={`/dashboard/campaigns/${campaign.id}/edit`}
                className={`inline-flex justify-center rounded-xl px-5 py-2.5 text-sm font-semibold ${
                  isDark ? "bg-primary-600 text-white hover:bg-primary-500" : "bg-primary-950 text-white hover:bg-primary-900"
                }`}
              >
                {t.editCampaign}
              </Link>
            ) : (
              <span title={t.draftOnlyTooltip} className="inline-flex">
                <span
                  className={`cursor-not-allowed rounded-xl px-5 py-2.5 text-sm font-semibold opacity-50 ${
                    isDark ? "bg-primary-600/50 text-white" : "bg-primary-950/50 text-white"
                  }`}
                >
                  {t.editCampaign}
                </span>
              </span>
            )}

            {isDraft ? (
              <button
                type="button"
                onClick={() => void handleSubmitCampaign()}
                disabled={!canSubmitCampaign || isSubmittingCampaign}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white ${
                  canSubmitCampaign
                    ? isDark
                      ? "bg-emerald-600 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                      : "bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    : "cursor-not-allowed bg-emerald-600/50 opacity-60"
                }`}
                title={!canSubmitCampaign ? t.submitCampaignBlockedDescription : undefined}
              >
                {isSubmittingCampaign ? t.submittingCampaign : t.submitCampaign}
              </button>
            ) : null}

            {isDraft ? (
              <button
                type="button"
                onClick={() => (canDeleteCampaign ? setCampaignDeleteOpen(true) : null)}
                disabled={!canDeleteCampaign || deletingCampaign}
                title={!canDeleteCampaign && hasInvestors ? t.deleteCampaignBlockedInvestors : undefined}
                className={`rounded-xl border px-5 py-2.5 text-sm font-semibold ${
                  canDeleteCampaign
                    ? isDark
                      ? "border-red-500/50 text-red-200 hover:bg-red-500/10"
                      : "border-red-300 text-red-700 hover:bg-red-50"
                    : "cursor-not-allowed opacity-40"
                }`}
              >
                {t.deleteCampaign}
              </button>
            ) : (
              <span title={t.draftOnlyTooltip} className="inline-flex">
                <span
                  className={`cursor-not-allowed rounded-xl border px-5 py-2.5 text-sm font-semibold opacity-50 ${
                    isDark ? "border-red-500/35 text-red-200" : "border-red-200 text-red-700"
                  }`}
                >
                  {t.deleteCampaign}
                </span>
              </span>
            )}
          </div>

          {!canDeleteCampaign && isDraft && hasInvestors ? <p className={`text-xs ${isDark ? "text-amber-300" : "text-amber-800"}`}>{t.deleteCampaignBlockedInvestors}</p> : null}
          {isDraft && !canSubmitCampaign ? (
            <p className={`text-xs ${isDark ? "text-amber-300" : "text-amber-800"}`}>{t.submitCampaignBlockedDescription}</p>
          ) : null}

          {!isDraft ? (
            <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`} title={t.draftOnlyTooltip}>
              {t.draftOnlyTooltip}
            </p>
          ) : null}
        </section>
      ) : null}

      <ConfirmDialog
        open={campaignDeleteOpen}
        title={t.confirmDeleteCampaignTitle}
        description={t.confirmDeleteCampaignBody}
        cancelLabel={t.cancelAction}
        confirmLabel={t.confirmDelete}
        submittingLabel={t.deleting}
        onCancel={() => setCampaignDeleteOpen(false)}
        onConfirm={() => void handleDeleteCampaignConfirmed()}
        isDark={isDark}
        variant="danger"
        isSubmitting={deletingCampaign}
      />

      <ConfirmDialog
        open={documentToDelete != null}
        title={t.confirmDeleteDocumentTitle}
        description={t.confirmDeleteDocumentBody}
        cancelLabel={t.cancelAction}
        confirmLabel={t.confirmDelete}
        submittingLabel={t.deleting}
        onCancel={() => setDocumentToDelete(null)}
        onConfirm={() => void handleDeleteDocumentConfirmed()}
        isDark={isDark}
        variant="danger"
        isSubmitting={deletingDocument}
      >
        {documentToDelete ? (
          <p className={`text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
            {documentToDelete.documentName?.trim() || t.untitledDocument}
          </p>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
