import type { RefObject } from "react";
import type { messages } from "@/locales";

type Translation = (typeof messages)["en"]["createCampaignPage"];

type CreateCampaignHeroUploadProps = {
  t: Translation;
  isDark: boolean;
  sectionCardClass: string;
  primaryActionClass: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  uploadError: string | null;
  uploadedUrl: string | null;
  copied: boolean;
  onFileChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
  onPickFile: () => void;
  onCopyUrl: () => void;
};

export function CreateCampaignHeroUpload({
  t,
  isDark,
  sectionCardClass,
  primaryActionClass,
  fileInputRef,
  isUploading,
  uploadError,
  uploadedUrl,
  copied,
  onFileChange,
  onPickFile,
  onCopyUrl,
}: CreateCampaignHeroUploadProps) {
  return (
    <div className={`md:col-span-2 ${sectionCardClass}`}>
      <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.heroImageUpload}</h2>
      <p className={`mt-1 text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.heroImageUploadHint}</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={onFileChange}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onPickFile} disabled={isUploading} className={primaryActionClass}>
          {isUploading ? t.uploading : t.chooseImage}
        </button>
      </div>
      {uploadError ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{uploadError}</p> : null}
      {uploadedUrl ? (
        <div className={`mt-4 space-y-3 rounded-xl border p-4 ${isDark ? "border-white/15 bg-black/25" : "border-primary-100 bg-primary-50/40"}`}>
          <p className={`text-xs font-medium ${isDark ? "text-primary-300" : "text-primary-900"}`}>{t.pasteUrlHint}</p>
          <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={uploadedUrl} alt={t.heroPreviewAlt} className="max-h-40 w-full object-cover" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <input
              type="text"
              readOnly
              value={uploadedUrl}
              className={`min-w-0 flex-1 truncate rounded-xl border px-3 py-2 font-mono text-xs ${
                isDark ? "border-white/15 bg-zinc-950 text-zinc-100" : "border-zinc-200 bg-white text-zinc-800"
              }`}
              aria-label={t.uploadedUrlAria}
            />
            <button
              type="button"
              onClick={onCopyUrl}
              className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold ${
                copied
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200 dark:text-emerald-200"
                  : isDark
                    ? "border-zinc-500 text-zinc-200 hover:bg-white/10"
                    : "border-zinc-300 text-zinc-800 hover:bg-zinc-100"
              }`}
            >
              {copied ? t.copied : t.copy}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
