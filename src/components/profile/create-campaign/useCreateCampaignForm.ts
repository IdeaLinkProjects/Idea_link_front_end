import { useRouter } from "next/router";
import { type ChangeEvent, type FormEvent, useMemo, useRef, useState } from "react";
import { rowsToStoryRisksJson } from "@/components/profile/create-campaign/rowsToJson";
import { type CreateCampaignForm, initialCreateCampaignForm } from "@/components/profile/create-campaign/types";
import { toIsoFromLocalDateTime } from "@/components/profile/create-campaign/utils";
import { useKeyedRows } from "@/components/profile/create-campaign/useKeyedRows";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import { useCreateCampaignMutation, useUploadCampaignImageMutation } from "@/store";

export function useCreateCampaignForm() {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].createCampaignPage;
  const [createCampaign, { isLoading }] = useCreateCampaignMutation();
  const [uploadCampaignImage, { isLoading: isHeroImageUploading }] = useUploadCampaignImageMutation();

  const heroImageFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedHeroImageUrl, setUploadedHeroImageUrl] = useState<string | null>(null);
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateCampaignForm>(initialCreateCampaignForm);
  const storyKeyed = useKeyedRows();
  const risksKeyed = useKeyedRows();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const styles = useMemo(() => {
    const inputClass =
      "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";
    const cardClass = isDark
      ? "border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-950/90"
      : "border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-primary-50/30";
    const sectionCardClass = isDark
      ? "rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5"
      : "rounded-2xl border border-zinc-200/90 bg-white/70 p-4 sm:p-5";
    const secondaryBtnClass = isDark
      ? "rounded-xl border border-zinc-600 px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
      : "rounded-xl border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100";
    const dangerBtnClass = isDark
      ? "rounded-xl border border-red-500/40 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10"
      : "rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50";
    const backLinkClass = `inline-flex text-sm font-semibold ${isDark ? "text-primary-400 hover:text-primary-300" : "text-primary-700 hover:text-primary-800"}`;
    const primaryActionClass =
      "rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 bg-primary-600 hover:bg-primary-500";

    return { inputClass, cardClass, sectionCardClass, secondaryBtnClass, dangerBtnClass, backLinkClass, primaryActionClass };
  }, [isDark]);

  function updateField<K extends keyof CreateCampaignForm>(field: K, value: CreateCampaignForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleHeroImageFileChange(ev: ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    setHeroUploadError(null);
    setUploadedHeroImageUrl(null);

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setHeroUploadError(t.errors.notImageFile);
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadCampaignImage(formData).unwrap();
      if (!res.success) {
        setHeroUploadError(t.errors.uploadDidNotSucceed);
        return;
      }
      const url = res.file?.url?.trim();
      if (!url) {
        setHeroUploadError(t.errors.noUrlReturned);
        return;
      }
      setUploadedHeroImageUrl(url);
      setForm((prev) => ({ ...prev, heroImageUrl: url }));
    } catch (err) {
      setHeroUploadError(extractApiErrorMessage(err, t.errors.imageUploadFailed));
    }
  }

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setErrorMessage(null);

    if (!form.title.trim()) {
      setErrorMessage(t.errors.titleRequired);
      return;
    }
    if (!form.shortDescription.trim()) {
      setErrorMessage(t.errors.shortDescriptionRequired);
      return;
    }
    if (!form.heroImageUrl.trim()) {
      setErrorMessage(t.errors.heroImageRequired);
      return;
    }

    const fundingGoal = Number(form.fundingGoal);
    const equityOffered = Number(form.equityOffered);
    const valuation = Number(form.valuation);
    const minInvestment = Number(form.minInvestment);
    const totalShares = Number(form.totalShares);
    const minimumSharesPerInvestor = Number(form.minimumSharesPerInvestor);
    const durationDays = Number(form.durationDays);

    if (!Number.isFinite(fundingGoal) || fundingGoal <= 0) {
      setErrorMessage(t.errors.fundingGoal);
      return;
    }
    if (!Number.isFinite(equityOffered) || equityOffered <= 0 || equityOffered > 1) {
      setErrorMessage(t.errors.equityOffered);
      return;
    }
    if (!Number.isFinite(valuation) || valuation <= 0) {
      setErrorMessage(t.errors.valuation);
      return;
    }
    if (!Number.isFinite(minInvestment) || minInvestment <= 0) {
      setErrorMessage(t.errors.minInvestment);
      return;
    }
    if (!Number.isInteger(totalShares) || totalShares < 1) {
      setErrorMessage(t.errors.totalShares);
      return;
    }
    if (!Number.isInteger(minimumSharesPerInvestor) || minimumSharesPerInvestor < 1) {
      setErrorMessage(t.errors.minimumSharesPerInvestor);
      return;
    }
    if (minimumSharesPerInvestor > totalShares) {
      setErrorMessage(t.errors.minimumSharesExceedsTotal);
      return;
    }
    if (!Number.isInteger(durationDays) || durationDays < 1) {
      setErrorMessage(t.errors.durationDays);
      return;
    }

    const startDateIso = toIsoFromLocalDateTime(form.startDate);
    const endDateIso = toIsoFromLocalDateTime(form.endDate);
    if (!startDateIso || !endDateIso) {
      setErrorMessage(t.errors.datesRequired);
      return;
    }
    if (new Date(endDateIso).getTime() <= new Date(startDateIso).getTime()) {
      setErrorMessage(t.errors.endAfterStart);
      return;
    }

    const storyJson = rowsToStoryRisksJson(storyKeyed.rows);
    const risksJson = rowsToStoryRisksJson(risksKeyed.rows);

    try {
      const created = await createCampaign({
        title: form.title.trim(),
        shortDescription: form.shortDescription.trim(),
        heroImageUrl: form.heroImageUrl.trim(),
        storyJson,
        risksJson,
        fundingGoal,
        equityOffered,
        valuation,
        minInvestment,
        totalShares,
        minimumSharesPerInvestor,
        durationDays,
        startDate: startDateIso,
        endDate: endDateIso,
        tagIds: form.selectedTagIds,
      }).unwrap();

      await router.push(`/dashboard/projects/${created.id}/documents`);
    } catch (err) {
      setErrorMessage(extractApiErrorMessage(err, t.errors.createFailed));
    }
  }

  return {
    t,
    isDark,
    form,
    updateField,
    story: storyKeyed,
    risks: risksKeyed,
    handleSubmit,
    errorMessage,
    isLoading,
    isHeroImageUploading,
    heroImageFileInputRef,
    uploadedHeroImageUrl,
    heroUploadError,
    handleHeroImageFileChange,
    ...styles,
  };
}
