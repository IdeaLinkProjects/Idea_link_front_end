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
  onFileChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
  onPickFile: () => void;
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
  onFileChange,
  onPickFile,
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
        </div>
      ) : null}
    </div>
  );
}
