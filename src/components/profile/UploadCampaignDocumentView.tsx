import Link from "next/link";
import { useRouter } from "next/router";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  CAMPAIGN_DOCUMENT_TYPES,
  type CampaignDocumentType,
} from "@/constants/documentTypes";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import { useUploadCampaignDocumentMutation } from "@/store";

type UploadCampaignDocumentViewProps = {
  campaignId: number;
};

function documentTypeLabel(
  labels: Record<string, string>,
  value: CampaignDocumentType,
): string {
  return labels[value] ?? value.replaceAll("_", " ");
}

export function UploadCampaignDocumentView({ campaignId }: UploadCampaignDocumentViewProps) {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].uploadCampaignDocumentPage;
  const labels = t.documentTypeLabels as Record<string, string>;

  const [uploadCampaignDocument, { isLoading }] = useUploadCampaignDocumentMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState<CampaignDocumentType | "">("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSucceeded, setUploadSucceeded] = useState(false);

  const styles = useMemo(() => {
    const inputClass =
      "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";
    const cardClass = isDark
      ? "border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-950/90"
      : "border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-primary-50/30";
    const primaryBtn =
      "rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60";
    const secondaryBtnOutline = `rounded-xl border px-4 py-2 text-sm font-semibold ${
      isDark ? "border-zinc-600 text-zinc-300 hover:bg-zinc-800" : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
    }`;
    const backLinkClass = `inline-flex text-sm font-semibold ${
      isDark ? "text-primary-400 hover:text-primary-300" : "text-primary-700 hover:text-primary-800"
    }`;
    return { inputClass, cardClass, primaryBtn, secondaryBtnOutline, backLinkClass };
  }, [isDark]);

  useEffect(() => {
    if (!uploadSucceeded) return;
    const id = window.setTimeout(() => {
      void router.push("/dashboard/projects");
    }, 1800);
    return () => window.clearTimeout(id);
  }, [uploadSucceeded, router]);

  function handleFileChange(ev: ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0] ?? null;
    setSelectedFile(f);
    setErrorMessage(null);
  }

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setErrorMessage(null);

    if (!documentType) {
      setErrorMessage(t.errors.documentTypeRequired);
      return;
    }
    if (!documentNumber.trim()) {
      setErrorMessage(t.errors.documentNumberRequired);
      return;
    }
    if (!selectedFile) {
      setErrorMessage(t.errors.fileRequired);
      return;
    }

    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("documentNumber", documentNumber.trim());
    const trimmedName = documentName.trim();
    if (trimmedName) {
      formData.append("documentName", trimmedName);
    }
    formData.append("file", selectedFile);

    try {
      await uploadCampaignDocument({ campaignId, formData }).unwrap();
      setUploadSucceeded(true);
    } catch (err) {
      setErrorMessage(extractApiErrorMessage(err, t.errors.uploadFailed));
    }
  }

  const labelClass = `mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-2 sm:px-0">
      <Link href="/dashboard/projects" className={styles.backLinkClass}>
        {t.backToCampaigns}
      </Link>

      <section className={`rounded-3xl border p-4 shadow-sm sm:p-6 lg:p-8 ${styles.cardClass}`}>
        <div className="mb-6 flex flex-col gap-2">
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>{t.heading}</h1>
          <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.subtitle}</p>
        </div>

        {uploadSucceeded ? (
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400" role="status">
            {t.successMessage}
          </p>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label htmlFor="upload-doc-type" className={labelClass}>
                {t.documentType}
              </label>
              <select
                id="upload-doc-type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as CampaignDocumentType | "")}
                className={styles.inputClass}
                required={false}
              >
                <option value="" disabled>
                  —
                </option>
                {CAMPAIGN_DOCUMENT_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {documentTypeLabel(labels, value)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="upload-doc-number" className={labelClass}>
                {t.documentNumber}
              </label>
              <input
                id="upload-doc-number"
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder={t.documentNumberPlaceholder}
                className={styles.inputClass}
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="upload-doc-name" className={labelClass}>
                {t.documentName}{" "}
                <span className={`font-normal ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>({t.documentNameHint})</span>
              </label>
              <input
                id="upload-doc-name"
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder={t.documentNamePlaceholder}
                className={styles.inputClass}
                autoComplete="off"
              />
            </div>

            <div>
              <span className={labelClass}>{t.file}</span>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                aria-hidden
                tabIndex={-1}
                onChange={handleFileChange}
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={styles.secondaryBtnOutline}
                >
                  {t.chooseFile}
                </button>
                <span className={`min-w-0 max-w-full break-all text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  {selectedFile ? selectedFile.name : t.noFileChosen}
                </span>
              </div>
            </div>

            {errorMessage ? <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p> : null}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Link href="/dashboard/projects" className={`${styles.secondaryBtnOutline} text-center`}>
                {t.backToCampaigns}
              </Link>
              <button type="submit" disabled={isLoading} className={`${styles.primaryBtn} w-full sm:w-auto`}>
                {isLoading ? t.submitting : t.submit}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
