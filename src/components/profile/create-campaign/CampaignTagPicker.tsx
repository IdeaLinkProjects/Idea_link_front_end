import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetCampaignTagsQuery, useLazySearchCampaignTagsQuery } from "@/store";

const SEARCH_DEBOUNCE_MS = 280;

type CampaignTagPickerLabels = {
  tagsLabel: string;
  tagsSearchPlaceholder: string;
  tagsLoading: string;
  tagsEmpty: string;
  /** e.g. `Remove tag {name}` */
  tagRemoveAria: string;
};

type CampaignTagPickerProps = {
  fieldId?: string;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  isDark: boolean;
  inputClass: string;
  t: CampaignTagPickerLabels;
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function CampaignTagPicker({ fieldId = "campaign-tags-search", selectedIds, onChange, isDark, inputClass, t }: CampaignTagPickerProps) {
  const { data: allTags = [], isLoading: catalogLoading } = useGetCampaignTagsQuery();
  const [triggerSearch, { data: searchHits = [], isFetching: searchFetching }] = useLazySearchCampaignTagsQuery();

  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebouncedValue(searchText.trim(), SEARCH_DEBOUNCE_MS);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debouncedSearch) return;
    void triggerSearch({ query: debouncedSearch, limit: 10 });
  }, [debouncedSearch, triggerSearch]);

  const nameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const tag of allTags) m.set(tag.id, tag.name);
    for (const tag of searchHits) m.set(tag.id, tag.name);
    return m;
  }, [allTags, searchHits]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const suggestions = useMemo(() => {
    const excludeSelected = (list: { id: number; name: string }[]) => list.filter((x) => !selectedSet.has(x.id));

    if (debouncedSearch) {
      return excludeSelected(searchHits);
    }

    const q = searchText.trim().toLowerCase();
    const base = q
      ? allTags.filter((tag) => tag.name.toLowerCase().includes(q))
      : allTags;
    return excludeSelected(base).slice(0, 20);
  }, [allTags, searchHits, debouncedSearch, searchText, selectedSet]);

  const addTag = useCallback(
    (id: number) => {
      if (selectedSet.has(id)) return;
      onChange([...selectedIds, id]);
      setSearchText("");
    },
    [onChange, selectedIds, selectedSet],
  );

  const removeTag = useCallback(
    (id: number) => {
      onChange(selectedIds.filter((x) => x !== id));
    },
    [onChange, selectedIds],
  );

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(ev: MouseEvent) {
      const el = rootRef.current;
      if (el && !el.contains(ev.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  const panelClass = isDark
    ? "absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-zinc-600 bg-zinc-950 py-1 shadow-lg"
    : "absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg";
  const rowClass = isDark
    ? "flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm text-zinc-100 hover:bg-white/10"
    : "flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm text-zinc-900 hover:bg-zinc-100";
  const mutedClass = isDark ? "text-xs text-zinc-500" : "text-xs text-zinc-500";
  const chipClass = isDark
    ? "inline-flex items-center gap-1 rounded-lg border border-zinc-600 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-100"
    : "inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-800";

  const listBusy = catalogLoading || (Boolean(debouncedSearch) && searchFetching);

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={fieldId} className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
        {t.tagsLabel}
      </label>

      <div className="mb-2 flex flex-wrap gap-2">
        {selectedIds.map((id) => {
          const name = nameById.get(id) ?? `#${id}`;
          return (
            <span key={id} className={chipClass}>
              {name}
              <button
                type="button"
                className={isDark ? "rounded px-1 text-zinc-400 hover:text-white" : "rounded px-1 text-zinc-500 hover:text-zinc-900"}
                aria-label={t.tagRemoveAria.replace("{name}", name)}
                onClick={() => removeTag(id)}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>

      <input
        id={fieldId}
        type="text"
        autoComplete="off"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={t.tagsSearchPlaceholder}
        className={inputClass}
      />

      {open ? (
        <div className={panelClass} role="listbox" aria-busy={listBusy}>
          {listBusy ? (
            <div className={`px-3 py-2 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.tagsLoading}</div>
          ) : suggestions.length === 0 ? (
            <div className={`px-3 py-2 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.tagsEmpty}</div>
          ) : (
            suggestions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                role="option"
                className={rowClass}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  addTag(tag.id);
                  setOpen(true);
                }}
              >
                <span>{tag.name}</span>
                <span className={mutedClass}>{tag.campaignCount}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
