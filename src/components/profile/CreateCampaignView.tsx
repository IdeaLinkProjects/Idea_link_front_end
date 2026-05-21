import Link from "next/link";
import { CampaignTagPicker } from "@/components/profile/create-campaign/CampaignTagPicker";
import { CreateCampaignHeroUpload } from "@/components/profile/create-campaign/CreateCampaignHeroUpload";
import { CreateCampaignKeyedSection } from "@/components/profile/create-campaign/CreateCampaignKeyedSection";
import { useCreateCampaignForm } from "@/components/profile/create-campaign/useCreateCampaignForm";

export function CreateCampaignView() {
  const {
    t,
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
  } = useCreateCampaignForm();

  const labelClass = `mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/dashboard/projects" className={backLinkClass}>
        {t.backToCampaigns}
      </Link>

      <section className={`rounded-3xl border p-6 shadow-sm sm:p-8 ${cardClass}`}>
        <div className="mb-6 flex flex-col gap-2">
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>{t.heading}</h1>
          <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="campaign-title" className={labelClass}>
                {t.campaignTitle}
              </label>
              <input
                id="campaign-title"
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder={t.titlePlaceholder}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="campaign-short-description" className={labelClass}>
                {t.shortDescription}
              </label>
              <textarea
                id="campaign-short-description"
                rows={3}
                value={form.shortDescription}
                onChange={(e) => updateField("shortDescription", e.target.value)}
                placeholder={t.shortDescriptionPlaceholder}
                className={inputClass}
              />
            </div>

            <CreateCampaignHeroUpload
              t={t}
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
              <label htmlFor="campaign-funding-goal" className={labelClass}>
                {t.fundingGoal}
              </label>
              <input
                id="campaign-funding-goal"
                type="number"
                min="1"
                value={form.fundingGoal}
                onChange={(e) => updateField("fundingGoal", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="campaign-equity" className={labelClass}>
                {t.equityOffered}
              </label>
              <input
                id="campaign-equity"
                type="number"
                min="0.0001"
                max="1"
                step="0.0001"
                value={form.equityOffered}
                onChange={(e) => updateField("equityOffered", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="campaign-valuation" className={labelClass}>
                {t.valuation}
              </label>
              <input
                id="campaign-valuation"
                type="number"
                min="1"
                value={form.valuation}
                onChange={(e) => updateField("valuation", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="campaign-min-investment" className={labelClass}>
                {t.minInvestment}
              </label>
              <input
                id="campaign-min-investment"
                type="number"
                min="1"
                value={form.minInvestment}
                onChange={(e) => updateField("minInvestment", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="campaign-total-shares" className={labelClass}>
                {t.totalShares}
              </label>
              <input
                id="campaign-total-shares"
                type="number"
                min="1"
                step="1"
                value={form.totalShares}
                onChange={(e) => updateField("totalShares", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="campaign-min-shares" className={labelClass}>
                {t.minimumSharesPerInvestor}
              </label>
              <input
                id="campaign-min-shares"
                type="number"
                min="1"
                step="1"
                value={form.minimumSharesPerInvestor}
                onChange={(e) => updateField("minimumSharesPerInvestor", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="campaign-duration-days" className={labelClass}>
                {t.durationDays}
              </label>
              <input
                id="campaign-duration-days"
                type="number"
                min="1"
                step="1"
                value={form.durationDays}
                onChange={(e) => updateField("durationDays", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="campaign-start-date" className={labelClass}>
                {t.startDate}
              </label>
              <input
                id="campaign-start-date"
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="campaign-end-date" className={labelClass}>
                {t.endDate}
              </label>
              <input
                id="campaign-end-date"
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <CampaignTagPicker
                selectedIds={form.selectedTagIds}
                onChange={(ids) => updateField("selectedTagIds", ids)}
                isDark={isDark}
                inputClass={inputClass}
                t={{
                  tagsLabel: t.tagsLabel,
                  tagsSearchPlaceholder: t.tagsSearchPlaceholder,
                  tagsLoading: t.tagsLoading,
                  tagsEmpty: t.tagsEmpty,
                  tagRemoveAria: t.tagRemoveAriaPattern,
                }}
              />
            </div>
          </div>

          <CreateCampaignKeyedSection
            variant="story"
            t={t}
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
            t={t}
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
              href="/dashboard/projects"
              className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                isDark ? "border-zinc-600 text-zinc-300 hover:bg-zinc-800" : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {t.cancel}
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? t.submitting : t.submit}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
