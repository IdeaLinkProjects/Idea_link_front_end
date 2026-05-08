import Link from "next/link";
import { useRouter } from "next/router";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import { CheckCircle2, Circle, FileText } from "lucide-react";
import {
  CAMPAIGN_DOCUMENT_TYPES,
  type CampaignDocumentType,
} from "@/constants/documentTypes";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { KYC_STATUS, resolveAccountKycStatus } from "@/constants/kycStatus";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import type { CampaignDocument } from "@/store";
import {
  useGetCampaignByIdQuery,
  useGetUserRolesStatusQuery,
  useSubmitCampaignMutation,
  useUploadCampaignDocumentMutation,
} from "@/store";

type UploadCampaignDocumentViewProps = {
  campaignId: number;
};

function documentTypeLabel(
  labels: Record<string, string>,
  value: CampaignDocumentType,
): string {
  return labels[value] ?? value.replaceAll("_", " ");
}

function isCampaignDocumentType(value: string): value is CampaignDocumentType {
  return (CAMPAIGN_DOCUMENT_TYPES as readonly string[]).includes(value);
}

type DocRow = {
  documentNumber: string;
  documentName: string;
  file: File | null;
  error: string | null;
};

function emptyRow(): DocRow {
  return { documentNumber: "", documentName: "", file: null, error: null };
}

function initialRows(): Record<CampaignDocumentType, DocRow> {
  return CAMPAIGN_DOCUMENT_TYPES.reduce((acc, dt) => {
    acc[dt] = emptyRow();
    return acc;
  }, {} as Record<CampaignDocumentType, DocRow>);
}

function firstDocumentByType(documents: CampaignDocument[] | undefined): Map<CampaignDocumentType, CampaignDocument> {
  const map = new Map<CampaignDocumentType, CampaignDocument>();
  for (const d of documents ?? []) {
    if (!isCampaignDocumentType(d.documentType)) continue;
    if (!map.has(d.documentType)) map.set(d.documentType, d);
  }
  return map;
}

export function UploadCampaignDocumentView({ campaignId }: UploadCampaignDocumentViewProps) {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].uploadCampaignDocumentPage;
  const labels = t.documentTypeLabels as Record<string, string>;

  const { data: campaign, isLoading: campaignLoading } = useGetCampaignByIdQuery(campaignId);
  const { data: userRolesStatus } = useGetUserRolesStatusQuery();
  const [uploadCampaignDocument, { isLoading: mutationLoading }] = useUploadCampaignDocumentMutation();
  const [submitCampaign, { isLoading: isSubmittingCampaign }] = useSubmitCampaignMutation();

  const [rows, setRows] = useState<Record<CampaignDocumentType, DocRow>>(initialRows);
  const [replacing, setReplacing] = useState<Record<CampaignDocumentType, boolean>>(() =>
    CAMPAIGN_DOCUMENT_TYPES.reduce((acc, dt) => {
      acc[dt] = false;
      return acc;
    }, {} as Record<CampaignDocumentType, boolean>),
  );
  const [uploadingType, setUploadingType] = useState<CampaignDocumentType | null>(null);
  const [submitNotice, setSubmitNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [fileResetKey, setFileResetKey] = useState<Record<CampaignDocumentType, number>>(() =>
    CAMPAIGN_DOCUMENT_TYPES.reduce((acc, dt) => {
      acc[dt] = 0;
      return acc;
    }, {} as Record<CampaignDocumentType, number>),
  );

  const uploadedByType = useMemo(() => firstDocumentByType(campaign?.documents), [campaign?.documents]);
  const doneCount = uploadedByType.size;
  const totalCount = CAMPAIGN_DOCUMENT_TYPES.length;
  const allComplete = doneCount >= totalCount && CAMPAIGN_DOCUMENT_TYPES.every((dt) => !replacing[dt]);
  const accountKycStatus = resolveAccountKycStatus(
    userRolesStatus?.innovatorPrerequisites?.kycStatus,
    userRolesStatus?.investorPrerequisites?.kycStatus,
  );
  const canSubmitCampaign = accountKycStatus === KYC_STATUS.VERIFIED;

  const styles = useMemo(() => {
    const inputClass =
      "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";
    const cardClass = isDark
      ? "border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-950/90"
      : "border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-primary-50/30";
    const innerCardDone = isDark
      ? "rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4 sm:p-5"
      : "rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 sm:p-5";
    const innerCardPending = isDark
      ? "rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5"
      : "rounded-2xl border border-zinc-200/90 bg-white/80 p-4 sm:p-5";
    const primaryBtn =
      "rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60";
    const secondaryBtnOutline = `rounded-xl border px-3 py-2 text-sm font-semibold ${
      isDark ? "border-zinc-600 text-zinc-300 hover:bg-zinc-800" : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
    }`;
    const ghostBtn = `rounded-xl px-3 py-2 text-sm font-semibold ${
      isDark ? "text-primary-400 hover:bg-white/10" : "text-primary-700 hover:bg-primary-50"
    }`;
    const backLinkClass = `inline-flex text-sm font-semibold ${
      isDark ? "text-primary-400 hover:text-primary-300" : "text-primary-700 hover:text-primary-800"
    }`;
    const linkMuted = isDark ? "text-primary-400 underline-offset-2 hover:underline" : "text-primary-700 underline-offset-2 hover:underline";
    return {
      inputClass,
      cardClass,
      innerCardDone,
      innerCardPending,
      primaryBtn,
      secondaryBtnOutline,
      ghostBtn,
      backLinkClass,
      linkMuted,
    };
  }, [isDark]);

  const updateRow = useCallback((dt: CampaignDocumentType, patch: Partial<DocRow>) => {
    setRows((prev) => ({
      ...prev,
      [dt]: { ...prev[dt], ...patch },
    }));
  }, []);

  const startReplace = useCallback((dt: CampaignDocumentType) => {
    const doc = uploadedByType.get(dt);
    setReplacing((r) => ({ ...r, [dt]: true }));
    setRows((prev) => ({
      ...prev,
      [dt]: {
        ...emptyRow(),
        documentName: doc?.documentName?.trim() ?? "",
      },
    }));
    setFileResetKey((k) => ({ ...k, [dt]: k[dt] + 1 }));
  }, [uploadedByType]);

  const cancelReplace = useCallback((dt: CampaignDocumentType) => {
    setReplacing((r) => ({ ...r, [dt]: false }));
    setRows((prev) => ({ ...prev, [dt]: emptyRow() }));
    setFileResetKey((k) => ({ ...k, [dt]: k[dt] + 1 }));
  }, []);

  async function submitRow(dt: CampaignDocumentType) {
    const row = rows[dt];
    updateRow(dt, { error: null });

    if (!row.documentNumber.trim()) {
      updateRow(dt, { error: t.errors.documentNumberRequired });
      return;
    }
    if (!row.file) {
      updateRow(dt, { error: t.errors.fileRequired });
      return;
    }

    const formData = new FormData();
    formData.append("documentType", dt);
    formData.append("documentNumber", row.documentNumber.trim());
    const trimmedName = row.documentName.trim();
    if (trimmedName) {
      formData.append("documentName", trimmedName);
    }
    formData.append("file", row.file);

    setUploadingType(dt);
    try {
      await uploadCampaignDocument({ campaignId, formData }).unwrap();
      setRows((prev) => ({ ...prev, [dt]: emptyRow() }));
      setReplacing((r) => ({ ...r, [dt]: false }));
      setFileResetKey((k) => ({ ...k, [dt]: k[dt] + 1 }));
    } catch (err) {
      updateRow(dt, { error: extractApiErrorMessage(err, t.errors.uploadFailed) });
    } finally {
      setUploadingType(null);
    }
  }

  async function handleSubmitCampaign() {
    setSubmitNotice(null);
    try {
      await submitCampaign({ campaignId }).unwrap();
      setSubmitNotice({ tone: "ok", text: t.submitSuccess });
      await router.push(`/dashboard/campaigns/${campaignId}`);
    } catch (err) {
      setSubmitNotice({ tone: "err", text: extractApiErrorMessage(err, t.errors.submitFailed) });
    }
  }

  const labelClass = `mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`;
  const progressPct = Math.round((doneCount / totalCount) * 100);

  if (campaignLoading && !campaign) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-6 px-2 sm:px-0">
        <div className={`h-10 max-w-xs animate-pulse rounded-xl ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
        <div className={`h-64 animate-pulse rounded-3xl ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-2 sm:px-0">
      <Link href="/dashboard/projects" className={styles.backLinkClass}>
        {t.backToCampaigns}
      </Link>

      <section className={`rounded-3xl border p-4 shadow-sm sm:p-6 lg:p-8 ${styles.cardClass}`}>
        <div className="mb-6 flex flex-col gap-3">
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>{t.heading}</h1>
          <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.subtitleChecklist}</p>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className={`font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                {t.progressLabel.replace("{done}", String(doneCount)).replace("{total}", String(totalCount))}
              </span>
              <span className={isDark ? "text-zinc-500" : "text-zinc-500"}>{progressPct}%</span>
            </div>
            <div
              className={`h-2 overflow-hidden rounded-full ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}
              role="progressbar"
              aria-valuenow={doneCount}
              aria-valuemin={0}
              aria-valuemax={totalCount}
            >
              <div
                className="h-full rounded-full bg-primary-500 transition-[width] duration-300 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {allComplete ? (
          <div
            className={
              isDark
                ? "rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-6 text-center"
                : "rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center"
            }
            role="status"
          >
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" aria-hidden />
            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.allCompleteTitle}</h2>
            <p className={`mt-2 text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{t.allCompleteBody}</p>
            {submitNotice ? (
              <div
                role="status"
                className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                  submitNotice.tone === "ok"
                    ? isDark
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : isDark
                      ? "border-red-500/40 bg-red-500/10 text-red-200"
                      : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {submitNotice.text}
              </div>
            ) : null}
            <div
              className={`mt-4 rounded-2xl border p-4 text-left ${
                canSubmitCampaign
                  ? isDark
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-emerald-200 bg-emerald-50"
                  : isDark
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-amber-200 bg-amber-50"
              }`}
            >
              <p className={`text-sm ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
                {canSubmitCampaign ? t.submitReadyDescription : t.submitBlockedDescription}
              </p>
              {!canSubmitCampaign ? (
                <Link href="/kyc" className={`mt-2 inline-flex text-sm font-semibold ${styles.linkMuted}`}>
                  {t.goToKyc}
                </Link>
              ) : null}
            </div>
            <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void handleSubmitCampaign()}
                disabled={!canSubmitCampaign || isSubmittingCampaign}
                className={`${styles.primaryBtn} inline-flex min-w-[10rem] justify-center`}
              >
                {isSubmittingCampaign ? t.submittingCampaign : t.submitCampaign}
              </button>
              <Link
                href={`/dashboard/campaigns/${campaignId}`}
                className={`${styles.secondaryBtnOutline} inline-flex min-w-[10rem] justify-center`}
              >
                {t.viewCampaign}
              </Link>
              <Link href="/dashboard/projects" className={`${styles.secondaryBtnOutline} inline-flex min-w-[10rem] justify-center`}>
                {t.saveDraft}
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {CAMPAIGN_DOCUMENT_TYPES.map((dt, index) => {
              const uploaded = uploadedByType.get(dt);
              const isDone = Boolean(uploaded) && !replacing[dt];
              const row = rows[dt];
              const isUploadingThis = mutationLoading && uploadingType === dt;

              return (
                <li key={dt}>
                  <article
                    className={isDone ? styles.innerCardDone : styles.innerCardPending}
                    aria-labelledby={`doc-heading-${dt}`}
                  >
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <div className="mt-0.5 shrink-0" aria-hidden>
                          {isDone ? (
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                          ) : (
                            <Circle className={`h-6 w-6 ${isDark ? "text-zinc-600" : "text-zinc-300"}`} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                            {t.documentStep.replace("{n}", String(index + 1))}
                          </p>
                          <h2 id={`doc-heading-${dt}`} className={`text-base font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>
                            {documentTypeLabel(labels, dt)}
                          </h2>
                        </div>
                      </div>
                      {isDone ? (
                        <span
                          className={
                            isDark
                              ? "shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300"
                              : "shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                          }
                        >
                          {t.uploadedBadge}
                        </span>
                      ) : null}
                    </div>

                    {isDone ? (
                      <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                        <div className="flex min-w-0 items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                          <span className="truncate font-medium">{uploaded?.documentName?.trim() || documentTypeLabel(labels, dt)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {uploaded?.documentUrl ? (
                            <a
                              href={uploaded.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.linkMuted}
                            >
                              {t.viewFile}
                            </a>
                          ) : null}
                          <button type="button" onClick={() => startReplace(dt)} className={styles.ghostBtn}>
                            {t.replace}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor={`doc-number-${dt}`} className={labelClass}>
                              {t.documentNumber}
                            </label>
                            <input
                              id={`doc-number-${dt}`}
                              type="text"
                              value={row.documentNumber}
                              onChange={(e) => updateRow(dt, { documentNumber: e.target.value, error: null })}
                              placeholder={t.documentNumberPlaceholder}
                              className={styles.inputClass}
                              autoComplete="off"
                              disabled={isUploadingThis}
                            />
                          </div>
                          <div>
                            <label htmlFor={`doc-name-${dt}`} className={labelClass}>
                              {t.documentName}{" "}
                              <span className={`font-normal ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>({t.documentNameHint})</span>
                            </label>
                            <input
                              id={`doc-name-${dt}`}
                              type="text"
                              value={row.documentName}
                              onChange={(e) => updateRow(dt, { documentName: e.target.value, error: null })}
                              placeholder={t.documentNamePlaceholder}
                              className={styles.inputClass}
                              autoComplete="off"
                              disabled={isUploadingThis}
                            />
                          </div>
                        </div>

                        <div>
                          <span className={labelClass}>{t.file}</span>
                          <input
                            key={fileResetKey[dt]}
                            id={`doc-file-${dt}`}
                            type="file"
                            className="sr-only"
                            aria-label={t.file}
                            onChange={(ev: ChangeEvent<HTMLInputElement>) => {
                              const f = ev.target.files?.[0] ?? null;
                              updateRow(dt, { file: f, error: null });
                            }}
                            disabled={isUploadingThis}
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <label
                              htmlFor={`doc-file-${dt}`}
                              className={`${styles.secondaryBtnOutline} inline-block cursor-pointer ${isUploadingThis ? "pointer-events-none opacity-60" : ""}`}
                            >
                              {t.chooseFile}
                            </label>
                            <span className={`min-w-0 max-w-full break-all text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                              {row.file ? row.file.name : t.noFileChosen}
                            </span>
                          </div>
                        </div>

                        {row.error ? <p className="text-sm text-red-600 dark:text-red-400">{row.error}</p> : null}

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            disabled={isUploadingThis}
                            onClick={() => void submitRow(dt)}
                            className={styles.primaryBtn}
                          >
                            {isUploadingThis ? t.uploadingRow : t.uploadThisType}
                          </button>
                          {replacing[dt] ? (
                            <button type="button" onClick={() => cancelReplace(dt)} className={styles.secondaryBtnOutline}>
                              {t.cancelReplace}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        )}

        {!allComplete ? (
          <p className={`mt-6 text-center text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.footerHint}</p>
        ) : null}
      </section>
    </div>
  );
}
