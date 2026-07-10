import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { CampaignTagPicker } from "@/components/profile/create-campaign/CampaignTagPicker";
import { CreateCampaignHeroUpload } from "@/components/profile/create-campaign/CreateCampaignHeroUpload";
import { CreateCampaignKeyedSection } from "@/components/profile/create-campaign/CreateCampaignKeyedSection";
import { useEditCampaignForm } from "@/components/profile/create-campaign/useEditCampaignForm";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";

function normalizeStatus(status: string) {
  return status.trim().toLowerCase();
}

type CampaignEditViewProps = {
  campaignId: number;
};

export function CampaignEditView({ campaignId }: CampaignEditViewProps) {
  const router = useRouter();
  const {
    tEdit,
    tFields,
    campaignQuery,
    isBootstrapping,
    isDark,
    form,
    updateField,
    story,
    risks,
    handleSubmit,
    errorMessage,
    isLoading,
    isHeroImageUploading,
    heroImageFileInputRef,
    uploadedHeroImageUrl,
    heroUploadError,
    handleHeroImageFileChange,
    inputClass,
    cardClass,
    sectionCardClass,
    secondaryBtnClass,
    dangerBtnClass,
    backLinkClass,
    primaryActionClass,
  } = useEditCampaignForm(campaignId);

  useEffect(() => {
    const c = campaignQuery.data;
    if (!c) return;
    if (normalizeStatus(c.status) !== "draft") {
      void router.replace(`/dashboard/campaigns/${campaignId}`);
    }
  }, [campaignQuery.data, router, campaignId]);

  const labelClass = `mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`;

  if (isBootstrapping) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse space-y-4">
        <div className={`h-10 max-w-xs rounded-xl ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
        <div className={`h-64 rounded-3xl ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />
      </div>
    );
  }

  if (campaignQuery.isError || form == null) {
    return (
      <section className={`mx-auto max-w-xl rounded-3xl border p-6 ${cardClass}`}>
        <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{tEdit.errors.loadFailed}</h2>
        <p className={`mt-2 text-sm ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
          {extractApiErrorMessage(campaignQuery.error, tEdit.errors.loadRetry)}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => campaignQuery.refetch()}
            className="rounded-xl bg-primary-950 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900"
          >
            {tEdit.retry}
          </button>
          <Link
            href={`/dashboard/campaigns/${campaignId}`}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
              isDark ? "border-zinc-600 text-zinc-200 hover:bg-white/10" : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {tEdit.backToDetail}
          </Link>
        </div>
      </section>
    );
  }

  if (campaignQuery.data && normalizeStatus(campaignQuery.data.status) !== "draft") {
    return <p className="sr-only">{tEdit.redirecting}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/dashboard/campaigns/${campaignId}`} className={backLinkClass}>
          {tEdit.backToDetail}
        </Link>
      </div>

      <section className={`rounded-3xl border p-6 shadow-sm sm:p-8 ${cardClass}`}>
        <div className="mb-6 flex flex-col gap-2">
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>{tEdit.heading}</h1>
          <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{tEdit.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="edit-campaign-title" className={labelClass}>
                {tFields.campaignTitle}
              </label>
              <input
                id="edit-campaign-title"
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder={tFields.titlePlaceholder}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="edit-campaign-short-description" className={labelClass}>
                {tFields.shortDescription}
              </label>
              <textarea
                id="edit-campaign-short-description"
                rows={3}
                value={form.shortDescription}
                onChange={(e) => updateField("shortDescription", e.target.value)}
                placeholder={tFields.shortDescriptionPlaceholder}
                className={inputClass}
              />
            </div>

            <CreateCampaignHeroUpload
              t={tFields}
              isDark={isDark}
              sectionCardClass={`md:col-span-2 ${sectionCardClass}`}
              primaryActionClass={primaryActionClass}
              fileInputRef={heroImageFileInputRef}
              isUploading={isHeroImageUploading}
              uploadError={heroUploadError}
              uploadedUrl={uploadedHeroImageUrl}
              onFileChange={handleHeroImageFileChange}
              onPickFile={() => heroImageFileInputRef.current?.click()}
            />

            <div>
              <label htmlFor="edit-campaign-funding-goal" className={labelClass}>
                {tFields.fundingGoal}
              </label>
              <input
                id="edit-campaign-funding-goal"
                type="number"
                min="1"
                value={form.fundingGoal}
                onChange={(e) => updateField("fundingGoal", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="edit-campaign-equity" className={labelClass}>
                {tFields.equityOffered}
              </label>
              <input
                id="edit-campaign-equity"
                type="number"
                min="1"
                max="100"
                step="1"
                value={form.equityOffered}
                onChange={(e) => updateField("equityOffered", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="edit-campaign-valuation" className={labelClass}>
                {tFields.valuation}
              </label>
              <input id="edit-campaign-valuation" type="number" min="1" value={form.valuation} onChange={(e) => updateField("valuation", e.target.value)} className={inputClass} />
            </div>

            <div>
              <label htmlFor="edit-campaign-min-investment" className={labelClass}>
                {tFields.minInvestment}
              </label>
              <input
                id="edit-campaign-min-investment"
                type="number"
                min="1"
                value={form.minInvestment}
                onChange={(e) => updateField("minInvestment", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="edit-campaign-total-shares" className={labelClass}>
                {tFields.totalShares}
              </label>
              <input
                id="edit-campaign-total-shares"
                type="number"
                min="1"
                step="1"
                value={form.totalShares}
                onChange={(e) => updateField("totalShares", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="edit-campaign-min-shares" className={labelClass}>
                {tFields.minimumSharesPerInvestor}
              </label>
              <input
                id="edit-campaign-min-shares"
                type="number"
                min="1"
                step="1"
                value={form.minimumSharesPerInvestor}
                onChange={(e) => updateField("minimumSharesPerInvestor", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="edit-campaign-duration-days" className={labelClass}>
                {tFields.durationDays}
              </label>
              <input
                id="edit-campaign-duration-days"
                type="number"
                min="1"
                step="1"
                value={form.durationDays}
                onChange={(e) => updateField("durationDays", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <CampaignTagPicker
                fieldId="edit-campaign-tags-search"
                selectedIds={form.selectedTagIds}
                onChange={(ids) => updateField("selectedTagIds", ids)}
                isDark={isDark}
                inputClass={inputClass}
                t={{
                  tagsLabel: tFields.tagsLabel,
                  tagsSearchPlaceholder: tFields.tagsSearchPlaceholder,
                  tagsLoading: tFields.tagsLoading,
                  tagsEmpty: tFields.tagsEmpty,
                  tagRemoveAria: tFields.tagRemoveAriaPattern,
                }}
              />
            </div>
          </div>

          <CreateCampaignKeyedSection
            variant="story"
            t={tFields}
            isDark={isDark}
            rows={story.rows}
            sectionCardClass={sectionCardClass}
            secondaryBtnClass={secondaryBtnClass}
            dangerBtnClass={dangerBtnClass}
            inputClass={inputClass}
            onAdd={story.addRow}
            onRemove={story.removeRow}
            onChangeRow={story.updateRow}
          />

          <CreateCampaignKeyedSection
            variant="risks"
            t={tFields}
            isDark={isDark}
            rows={risks.rows}
            sectionCardClass={sectionCardClass}
            secondaryBtnClass={secondaryBtnClass}
            dangerBtnClass={dangerBtnClass}
            inputClass={inputClass}
            onAdd={risks.addRow}
            onRemove={risks.removeRow}
            onChangeRow={risks.updateRow}
          />

          {errorMessage ? <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p> : null}

          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/dashboard/campaigns/${campaignId}`}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                isDark ? "border-zinc-600 text-zinc-300 hover:bg-zinc-800" : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {tFields.cancel}
            </Link>
            <button type="submit" disabled={isLoading} className={primaryActionClass}>
              {isLoading ? tEdit.submitting : tEdit.submit}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
