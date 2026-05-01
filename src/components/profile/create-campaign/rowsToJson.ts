import type { StoryRisksItem } from "@/components/profile/create-campaign/types";

/** Matches prior behavior: only rows with a non-empty `key` string (no trim). */
export function rowsToStoryRisksJson(rows: StoryRisksItem[]): Record<string, string> {
  return Object.fromEntries(rows.filter((item) => item.key).map((item) => [item.key, item.value]));
}
