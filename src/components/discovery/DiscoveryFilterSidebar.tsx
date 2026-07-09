import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { CAMPAIGN_FILTER_STATUS_OPTIONS, useGetCampaignTagsQuery } from "@/store";
import type { DiscoveryFilterFormState } from "./useDiscoverySection";
import type { DiscoveryCopy, DiscoveryFilterUi } from "./types";
import type { DiscoveryTheme } from "./discoveryTheme";

type DiscoveryFilterSidebarProps = {
  filterForm: DiscoveryFilterFormState;
  onKeywordChange: (keyword: string) => void;
  onToggleStatus: (status: string) => void;
  onToggleTag: (tagId: number) => void;
  onPatchForm: (patch: Partial<DiscoveryFilterFormState>) => void;
  onReset: () => void;
  copy: DiscoveryCopy;
  filterUi: DiscoveryFilterUi;
  theme: DiscoveryTheme;
  isDark: boolean;
};

export function DiscoveryFilterSidebar({
  filterForm,
  onKeywordChange,
  onToggleStatus,
  onToggleTag,
  onPatchForm,
  onReset,
  copy,
  filterUi: fu,
  theme,
  isDark,
}: DiscoveryFilterSidebarProps) {
  const tagsQuery = useGetCampaignTagsQuery();
  const { panel, label, input, muted, checkClass } = theme;

  return (
    <aside className={`w-full shrink-0 space-y-5 lg:sticky lg:top-24 lg:w-80 ${panel}`}>
      <div className="flex items-center gap-3 border-b border-dashed pb-4 dark:border-white/10">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-md shadow-primary-900/25">
          <SlidersHorizontal className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>{fu.sidebarTitle}</h2>
        </div>
      </div>

      <div>
        <p className={`${label} mb-2`}>{fu.keywordLabel}</p>
        <div className="relative">
          <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm ${muted}`} aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            value={filterForm.keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className={`${input} pl-9 pr-10`}
            aria-label={copy.searchPlaceholder}
          />
          {filterForm.keyword ? (
            <button
              type="button"
              onClick={() => onKeywordChange("")}
              className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold ${muted} transition hover:bg-zinc-200/80 dark:hover:bg-white/10`}
              aria-label={fu.clearKeyword}
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      <details className="group" open>
        <summary
          className={`flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition [&::-webkit-details-marker]:hidden ${
            isDark
              ? "border-white/12 bg-white/[0.04] text-zinc-100 hover:bg-white/[0.07]"
              : "border-zinc-200 bg-zinc-50/80 text-zinc-800 hover:border-primary-200/80 hover:bg-primary-50/40"
          }`}
        >
          <span>{fu.advancedSearch}</span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-primary-600 transition-transform duration-200 group-open:rotate-180 dark:text-primary-400"
            aria-hidden
          />
        </summary>

        <div className="mt-4 space-y-5 border-t border-dashed border-zinc-200/80 pt-4 dark:border-white/10">
          <div>
            <p className={`${label} mb-2`}>{fu.statusTitle}</p>
            <div className="flex flex-col gap-1.5">
              {CAMPAIGN_FILTER_STATUS_OPTIONS.map((status) => (
                <label
                  key={status}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg py-0.5 text-sm transition hover:bg-black/[0.04] dark:hover:bg-white/[0.04] ${isDark ? "text-zinc-200" : "text-zinc-800"}`}
                >
                  <input
                    type="checkbox"
                    checked={filterForm.statuses.includes(status)}
                    onChange={() => onToggleStatus(status)}
                    className={checkClass}
                  />
                  <span>{fu.statusLabels[status]}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className={`${label} mb-2`}>{fu.tagsTitle}</p>
            <div className="max-h-48 space-y-1.5 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-color:rgba(16,185,129,0.45)_transparent] [scrollbar-width:thin] dark:[scrollbar-color:rgba(16,185,129,0.35)_transparent]">
              {tagsQuery.isLoading ? (
                <p className={`text-sm ${muted}`}>…</p>
              ) : tagsQuery.data?.length ? (
                tagsQuery.data.map((tag) => (
                  <label
                    key={tag.id}
                    className={`flex cursor-pointer items-center justify-between gap-2 text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filterForm.tagIds.includes(tag.id)}
                        onChange={() => onToggleTag(tag.id)}
                        className={checkClass}
                      />
                      <span className="truncate">{tag.name}</span>
                    </span>
                    <span className={`shrink-0 text-xs tabular-nums ${muted}`}>({tag.campaignCount})</span>
                  </label>
                ))
              ) : (
                <p className={`text-sm ${muted}`}>{fu.tagsEmpty}</p>
              )}
            </div>
          </div>

          <div>
            <p className={`${label} mb-2`}>{fu.datesTitle}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <DateField label={fu.startFrom} value={filterForm.startDateFrom} onChange={(v) => onPatchForm({ startDateFrom: v })} inputClass={input} mutedClass={muted} />
              <DateField label={fu.startTo} value={filterForm.startDateTo} onChange={(v) => onPatchForm({ startDateTo: v })} inputClass={input} mutedClass={muted} />
              <DateField label={fu.endFrom} value={filterForm.endDateFrom} onChange={(v) => onPatchForm({ endDateFrom: v })} inputClass={input} mutedClass={muted} />
              <DateField label={fu.endTo} value={filterForm.endDateTo} onChange={(v) => onPatchForm({ endDateTo: v })} inputClass={input} mutedClass={muted} />
            </div>
          </div>

          <div>
            <p className={`${label} mb-2`}>{fu.fundingTitle}</p>
            <div className="grid grid-cols-2 gap-2">
              <NumberField placeholder={fu.fundingMin} value={filterForm.fundingMin} onChange={(v) => onPatchForm({ fundingMin: v })} inputClass={input} />
              <NumberField placeholder={fu.fundingMax} value={filterForm.fundingMax} onChange={(v) => onPatchForm({ fundingMax: v })} inputClass={input} />
            </div>
          </div>

          <div>
            <p className={`${label} mb-2`}>{fu.investmentTitle}</p>
            <div className="grid grid-cols-2 gap-2">
              <NumberField placeholder={fu.investmentMin} value={filterForm.investMin} onChange={(v) => onPatchForm({ investMin: v })} inputClass={input} />
              <NumberField placeholder={fu.investmentMax} value={filterForm.investMax} onChange={(v) => onPatchForm({ investMax: v })} inputClass={input} />
            </div>
          </div>

          <CheckboxField
            checked={filterForm.activeNow}
            onChange={(activeNow) => onPatchForm({ activeNow })}
            label={fu.activeNow}
            checkClass={checkClass}
            isDark={isDark}
          />
          <CheckboxField
            checked={filterForm.funded}
            onChange={(funded) => onPatchForm({ funded })}
            label={fu.funded}
            checkClass={checkClass}
            isDark={isDark}
          />
        </div>
      </details>

      <button
        type="button"
        onClick={onReset}
        className={`w-full rounded-xl border py-2.5 text-sm font-semibold transition ${isDark ? "border-white/15 text-zinc-200 hover:border-white/25 hover:bg-white/[0.06]" : "border-zinc-200 text-zinc-700 hover:border-primary-200 hover:bg-primary-50/50 hover:text-primary-900"}`}
      >
        {fu.reset}
      </button>
    </aside>
  );
}

function DateField({
  label,
  value,
  onChange,
  inputClass,
  mutedClass,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  mutedClass: string;
}) {
  return (
    <div>
      <span className={`mb-1 block text-[11px] font-medium ${mutedClass}`}>{label}</span>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </div>
  );
}

function NumberField({
  placeholder,
  value,
  onChange,
  inputClass,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
}) {
  return (
    <input
      type="number"
      min={0}
      inputMode="numeric"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
  );
}

function CheckboxField({
  checked,
  onChange,
  label,
  checkClass,
  isDark,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  checkClass: string;
  isDark: boolean;
}) {
  return (
    <label className={`flex cursor-pointer items-center gap-2.5 rounded-lg py-0.5 text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className={checkClass} />
      {label}
    </label>
  );
}
