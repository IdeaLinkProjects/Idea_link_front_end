import type { messages } from "@/locales";

import type { StoryRisksItem } from "@/components/profile/create-campaign/types";

type Translation = (typeof messages)["en"]["createCampaignPage"];

type Variant = "story" | "risks";

type CreateCampaignKeyedSectionProps = {
  variant: Variant;
  t: Translation;
  isDark: boolean;
  rows: StoryRisksItem[];
  sectionCardClass: string;
  secondaryBtnClass: string;
  dangerBtnClass: string;
  inputClass: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChangeRow: (index: number, field: keyof StoryRisksItem, value: string) => void;
};

export function CreateCampaignKeyedSection({
  variant,
  t,
  isDark,
  rows,
  sectionCardClass,
  secondaryBtnClass,
  dangerBtnClass,
  inputClass,
  onAdd,
  onRemove,
  onChangeRow,
}: CreateCampaignKeyedSectionProps) {
  const titlePlaceholder = variant === "story" ? t.storyTitlePlaceholder : t.riskTitlePlaceholder;
  const descriptionPlaceholder = variant === "story" ? t.storyDescriptionPlaceholder : t.riskDescriptionPlaceholder;
  const heading = variant === "story" ? t.story : t.risks;
  const hint = variant === "story" ? t.storyHint : t.risksHint;
  const idPrefix = variant === "story" ? "story" : "risk";

  const labelClass = `mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`;
  const rowShellClass = `rounded-xl border p-4 ${isDark ? "border-white/10 bg-black/20" : "border-zinc-200 bg-zinc-50/80"}`;
  const rowHeaderClass = `text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-400" : "text-zinc-500"}`;

  return (
    <div className={sectionCardClass}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{heading}</h2>
          <p className={`mt-0.5 text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{hint}</p>
        </div>
        <button type="button" onClick={onAdd} className={secondaryBtnClass}>
          {t.addSection}
        </button>
      </div>
      <div className="space-y-4">
        {rows.map((item, index) => (
          <div key={`${idPrefix}-${index}`} className={rowShellClass}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className={rowHeaderClass}>{t.sectionNumber.replace("{number}", String(index + 1))}</span>
              <button type="button" onClick={() => onRemove(index)} className={dangerBtnClass}>
                {t.removeSection}
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label htmlFor={`${idPrefix}-title-${index}`} className={labelClass}>
                  {t.sectionTitle}
                </label>
                <input
                  id={`${idPrefix}-title-${index}`}
                  type="text"
                  value={item.key}
                  onChange={(e) => onChangeRow(index, "key", e.target.value)}
                  placeholder={titlePlaceholder}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`${idPrefix}-description-${index}`} className={labelClass}>
                  {t.sectionDescription}
                </label>
                <textarea
                  id={`${idPrefix}-description-${index}`}
                  rows={4}
                  value={item.value}
                  onChange={(e) => onChangeRow(index, "value", e.target.value)}
                  placeholder={descriptionPlaceholder}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
