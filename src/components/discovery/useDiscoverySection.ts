import { hasStoredAuthTokens } from "@/lib/auth/tokenStorage";
import type { CampaignFilterFilters, CampaignFilterRequestBody } from "@/store";
import { useFilterCampaignsQuery, useGetSavedCampaignsQuery } from "@/store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DISCOVERY_KEYWORD_DEBOUNCE_MS, DISCOVERY_PAGE_SIZE } from "./constants";
import {
  optionalIsoFromDateInput,
  parseOptionalPositiveInt,
} from "./discoveryFormatters";
import type { DiscoveryView } from "./types";
import { useDebouncedValue } from "./useDebouncedValue";

export type DiscoveryFilterFormState = {
  keyword: string;
  statuses: string[];
  tagIds: number[];
  startDateFrom: string;
  startDateTo: string;
  endDateFrom: string;
  endDateTo: string;
  fundingMin: string;
  fundingMax: string;
  investMin: string;
  investMax: string;
  activeNow: boolean;
  funded: boolean;
};

function createInitialFilterForm(keyword = ""): DiscoveryFilterFormState {
  return {
    keyword,
    statuses: [],
    tagIds: [],
    startDateFrom: "",
    startDateTo: "",
    endDateFrom: "",
    endDateTo: "",
    fundingMin: "",
    fundingMax: "",
    investMin: "",
    investMax: "",
    activeNow: false,
    funded: false,
  };
}

function buildCampaignFilters(form: DiscoveryFilterFormState, debouncedKeyword: string): CampaignFilterFilters {
  const filters: CampaignFilterFilters = {
    keyword: debouncedKeyword.trim(),
    statuses: [...form.statuses],
    tagIds: [...form.tagIds],
    activeNow: form.activeNow,
    funded: form.funded,
  };

  const startFrom = optionalIsoFromDateInput(form.startDateFrom);
  const startTo = optionalIsoFromDateInput(form.startDateTo);
  const endFrom = optionalIsoFromDateInput(form.endDateFrom);
  const endTo = optionalIsoFromDateInput(form.endDateTo);
  if (startFrom) filters.startDateFrom = startFrom;
  if (startTo) filters.startDateTo = startTo;
  if (endFrom) filters.endDateFrom = endFrom;
  if (endTo) filters.endDateTo = endTo;

  const fundingMin = parseOptionalPositiveInt(form.fundingMin);
  const fundingMax = parseOptionalPositiveInt(form.fundingMax);
  if (fundingMin != null) filters.minFundingGoal = fundingMin;
  if (fundingMax != null) filters.maxFundingGoal = fundingMax;

  const investMin = parseOptionalPositiveInt(form.investMin);
  const investMax = parseOptionalPositiveInt(form.investMax);
  if (investMin != null) filters.minInvestment = investMin;
  if (investMax != null) filters.maxInvestment = investMax;

  return filters;
}

export function useDiscoverySection(initialKeyword = "") {
  const [filterForm, setFilterForm] = useState(() => createInitialFilterForm(initialKeyword));
  const [page, setPage] = useState(0);
  const [view, setView] = useState<DiscoveryView>("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (initialKeyword) {
      setFilterForm((prev) => ({ ...prev, keyword: initialKeyword }));
    }
  }, [initialKeyword]);

  useEffect(() => {
    const sync = () => setIsLoggedIn(hasStoredAuthTokens());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const debouncedKeyword = useDebouncedValue(filterForm.keyword, DISCOVERY_KEYWORD_DEBOUNCE_MS);

  const filters = useMemo(
    () => buildCampaignFilters(filterForm, debouncedKeyword),
    [filterForm, debouncedKeyword],
  );

  const requestBody: CampaignFilterRequestBody = useMemo(
    () => ({
      pagination: { page, size: DISCOVERY_PAGE_SIZE },
      filters,
    }),
    [page, filters],
  );

  const allCampaignsQuery = useFilterCampaignsQuery(requestBody, { skip: view === "saved" });
  const savedCampaignsQuery = useGetSavedCampaignsQuery(
    { page, size: DISCOVERY_PAGE_SIZE },
    { skip: view !== "saved" || !isLoggedIn },
  );

  const isSavedView = view === "saved";
  const activeQuery = isSavedView ? savedCampaignsQuery : allCampaignsQuery;

  const campaigns = activeQuery.data?.content ?? [];
  const totalElements = activeQuery.data?.totalElements ?? 0;
  const totalPages = Math.max(
    1,
    activeQuery.data?.totalPages ?? (Math.ceil(totalElements / DISCOVERY_PAGE_SIZE) || 1),
  );

  useEffect(() => {
    queueMicrotask(() => setPage(0));
  }, [
    debouncedKeyword,
    filterForm.statuses,
    filterForm.tagIds,
    filterForm.activeNow,
    filterForm.funded,
    filterForm.startDateFrom,
    filterForm.startDateTo,
    filterForm.endDateFrom,
    filterForm.endDateTo,
    filterForm.fundingMin,
    filterForm.fundingMax,
    filterForm.investMin,
    filterForm.investMax,
    view,
  ]);

  const patchFilterForm = useCallback((patch: Partial<DiscoveryFilterFormState>) => {
    setFilterForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleStatus = useCallback((status: string) => {
    setFilterForm((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  }, []);

  const toggleTag = useCallback((tagId: number) => {
    setFilterForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId) ? prev.tagIds.filter((id) => id !== tagId) : [...prev.tagIds, tagId],
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterForm(createInitialFilterForm());
    setPage(0);
  }, []);

  return {
    filterForm,
    patchFilterForm,
    toggleStatus,
    toggleTag,
    resetFilters,
    page,
    setPage,
    view,
    setView,
    isLoggedIn,
    isSavedView,
    campaigns,
    totalElements,
    totalPages,
    isLoading: activeQuery.isLoading,
    isFetching: activeQuery.isFetching,
    isError: activeQuery.isError,
    error: activeQuery.error,
    refetch: activeQuery.refetch,
  };
}
