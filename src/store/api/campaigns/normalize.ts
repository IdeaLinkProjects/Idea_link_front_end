import type { CampaignComment, CampaignCommentsPageResponse, CampaignUpdate } from "./types";

/** Spring Page / wrapped list responses → plain array for the UI. */
export function normalizeListResponse<T>(raw: unknown, nestedKeys: string[]): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    for (const key of nestedKeys) {
      const nested = record[key];
      if (Array.isArray(nested)) return nested as T[];
    }
  }
  return [];
}

export function normalizeCampaignUpdatesResponse(raw: unknown): CampaignUpdate[] {
  return normalizeListResponse<CampaignUpdate>(raw, ["content", "updates", "data", "items"]);
}

/** API may return `replies: null` when a comment has no replies. */
export function normalizeCampaignComment(raw: CampaignComment): CampaignComment {
  return {
    ...raw,
    replies: (raw.replies ?? []).map(normalizeCampaignComment),
  };
}

export function normalizeCampaignCommentsPageResponse(raw: unknown): CampaignCommentsPageResponse {
  const page = raw as CampaignCommentsPageResponse;
  return {
    ...page,
    content: (page.content ?? []).map(normalizeCampaignComment),
  };
}
