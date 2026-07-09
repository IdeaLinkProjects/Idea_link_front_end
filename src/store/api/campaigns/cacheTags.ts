const PROFILE_TAG = "Profile" as const;

export function campaignProfileTags(campaignId: number) {
  return [{ type: PROFILE_TAG, id: `campaign-${campaignId}` }, PROFILE_TAG] as const;
}

export function campaignUpdatesTags(campaignId: number) {
  return [{ type: PROFILE_TAG, id: `campaign-${campaignId}-updates` }] as const;
}

export function campaignCommentsTags(campaignId: number) {
  return [{ type: PROFILE_TAG, id: `campaign-${campaignId}-comments` }] as const;
}

export const SAVED_CAMPAIGNS_LIST_TAG = { type: PROFILE_TAG, id: "saved-campaigns" } as const;

export function savedCampaignsListTags() {
  return [SAVED_CAMPAIGNS_LIST_TAG] as const;
}
