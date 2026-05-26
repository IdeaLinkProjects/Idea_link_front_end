import { useRouter } from "next/router";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { rowsToStoryRisksJson } from "@/components/profile/create-campaign/rowsToJson";
import { type CreateCampaignForm, emptyStoryRisksRow } from "@/components/profile/create-campaign/types";
import { isoToDatetimeLocal, toIsoFromLocalDateTime } from "@/components/profile/create-campaign/utils";
import { useKeyedRows } from "@/components/profile/create-campaign/useKeyedRows";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import { useGetCampaignByIdQuery, useGetCampaignTagsQuery, useUpdateCampaignMutation, useUploadCampaignImageMutation } from "@/store";

function entriesFromJson(input: unknown): Array<[string, string]> {
  if (!input) return [];
  if (typeof input === "string") {
    try {
      return Object.entries(JSON.parse(input) as Record<string, string>);
    } catch {
      return [];
    }
  }
  if (typeof input === "object") return Object.entries(input as Record<string, string>);
  return [];
}

export function useEditCampaignForm(campaignId: number) {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const tEdit = messages[locale].campaignEditPage;
  const tFields = messages[locale].createCampaignPage;

  const campaignQuery = useGetCampaignByIdQuery(campaignId);
  const { data: tagCatalog = [] } = useGetCampaignTagsQuery();
  const [updateCampaign, { isLoading }] = useUpdateCampaignMutation();
  const [uploadCampaignImage, { isLoading: isHeroImageUploading }] = useUploadCampaignImageMutation();

  const heroImageFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedHeroImageUrl, setUploadedHeroImageUrl] = useState<string | null>(null);
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null);

  const didInitRef = useRef(false);
  /** `undefined` until campaign loaded; `null` if campaign has no tag names; otherwise names pending ID resolution */
  const tagNamesToResolveRef = useRef<string[] | null | undefined>(undefined);
  const resolvedCampaignTagsRef = useRef(false);
  const [form, setForm] = useState<CreateCampaignForm | null>(null);
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

  useEffect(() => {
    const c = campaignQuery.data;
    if (!c || didInitRef.current) return;

    didInitRef.current = true;

    const storyRows = entriesFromJson(c.storyJson);
    const riskRows = entriesFromJson(c.risksJson);

    storyKeyed.setRows(storyRows.length ? storyRows.map(([key, value]) => ({ key, value })) : [{ ...emptyStoryRisksRow }]);
    risksKeyed.setRows(riskRows.length ? riskRows.map(([key, value]) => ({ key, value })) : [{ ...emptyStoryRisksRow }]);

    tagNamesToResolveRef.current = c.tags?.length ? [...c.tags] : null;
    resolvedCampaignTagsRef.current = false;

    setForm({
      title: c.title ?? "",
      shortDescription: c.shortDescription ?? "",
      heroImageUrl: c.heroImageUrl ?? "",
      fundingGoal: String(c.fundingGoal ?? ""),
      equityOffered: String(c.equityOffered ?? ""),
      valuation: String(c.valuation ?? ""),
      minInvestment: String(c.minInvestment ?? ""),
      totalShares: String(c.totalShares ?? 1),
      minimumSharesPerInvestor: String(c.minimumSharesPerInvestor ?? 1),
      durationDays: String(c.durationDays ?? 1),
      startDate: isoToDatetimeLocal(c.startDate),
      endDate: isoToDatetimeLocal(c.endDate),
      selectedTagIds: [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when GET /campaigns/:id resolves
  }, [campaignQuery.data]);

  useEffect(() => {
    if (resolvedCampaignTagsRef.current) return;
    if (tagNamesToResolveRef.current === undefined) return;

    if (tagNamesToResolveRef.current === null) {
      resolvedCampaignTagsRef.current = true;
      return;
    }

    if (!tagCatalog.length) return;

    const lower = (s: string) => s.trim().toLowerCase();
    const names = tagNamesToResolveRef.current;
    const ids: number[] = [];
    for (const n of names) {
      const tag = tagCatalog.find((t) => lower(t.name) === lower(n));
      if (tag) ids.push(tag.id);
    }
    setForm((prev) => (prev ? { ...prev, selectedTagIds: ids } : prev));
    tagNamesToResolveRef.current = null;
    resolvedCampaignTagsRef.current = true;
  }, [tagCatalog]);

  function updateField<K extends keyof CreateCampaignForm>(field: K, value: CreateCampaignForm[K]) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleHeroImageFileChange(ev: ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    setHeroUploadError(null);
    setUploadedHeroImageUrl(null);

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setHeroUploadError(tFields.errors.notImageFile);
      return;
    }

    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await uploadCampaignImage(fd).unwrap();
      if (!res.success) {
        setHeroUploadError(tFields.errors.uploadDidNotSucceed);
        return;
      }
      const url = res.file?.url?.trim();
      if (!url) {
        setHeroUploadError(tFields.errors.noUrlReturned);
        return;
      }
      setUploadedHeroImageUrl(url);
      setForm((prev) => (prev ? { ...prev, heroImageUrl: url } : prev));
    } catch (err) {
      setHeroUploadError(extractApiErrorMessage(err, tFields.errors.imageUploadFailed));
    }
  }

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setErrorMessage(null);
    if (!form) return;

    if (!form.title.trim()) {
      setErrorMessage(tFields.errors.titleRequired);
      return;
    }
    if (!form.shortDescription.trim()) {
      setErrorMessage(tFields.errors.shortDescriptionRequired);
      return;
    }
    if (!form.heroImageUrl.trim()) {
      setErrorMessage(tFields.errors.heroImageRequired);
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
      setErrorMessage(tFields.errors.fundingGoal);
      return;
    }
    if (!Number.isFinite(equityOffered) || equityOffered <= 0 || equityOffered > 1) {
      setErrorMessage(tFields.errors.equityOffered);
      return;
    }
    if (!Number.isFinite(valuation) || valuation <= 0) {
      setErrorMessage(tFields.errors.valuation);
      return;
    }
    if (!Number.isFinite(minInvestment) || minInvestment <= 0) {
      setErrorMessage(tFields.errors.minInvestment);
      return;
    }
    if (!Number.isInteger(totalShares) || totalShares < 1) {
      setErrorMessage(tFields.errors.totalShares);
      return;
    }
    if (!Number.isInteger(minimumSharesPerInvestor) || minimumSharesPerInvestor < 1) {
      setErrorMessage(tFields.errors.minimumSharesPerInvestor);
      return;
    }
    if (minimumSharesPerInvestor > totalShares) {
      setErrorMessage(tFields.errors.minimumSharesExceedsTotal);
      return;
    }
    if (!Number.isInteger(durationDays) || durationDays < 1) {
      setErrorMessage(tFields.errors.durationDays);
      return;
    }

    const startDateIso = toIsoFromLocalDateTime(form.startDate);
    const endDateIso = toIsoFromLocalDateTime(form.endDate);
    if (!startDateIso || !endDateIso) {
      setErrorMessage(tFields.errors.datesRequired);
      return;
    }
    if (new Date(endDateIso).getTime() <= new Date(startDateIso).getTime()) {
      setErrorMessage(tFields.errors.endAfterStart);
      return;
    }

    const storyJson = rowsToStoryRisksJson(storyKeyed.rows);
    const risksJson = rowsToStoryRisksJson(risksKeyed.rows);

    try {
      await updateCampaign({
        id: campaignId,
        body: {
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
        },
      }).unwrap();

      await router.push(`/dashboard/campaigns/${campaignId}`);
    } catch (err) {
      setErrorMessage(extractApiErrorMessage(err, tEdit.errors.saveFailed));
    }
  }

  const isBootstrapping = campaignQuery.isLoading || campaignQuery.isFetching || form == null;

  return {
    tEdit,
    tFields,
    campaignQuery,
    isBootstrapping,
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
