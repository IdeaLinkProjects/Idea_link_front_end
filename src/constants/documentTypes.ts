/**
 * Values accepted by POST /campaigns/{campaignId}/documents (`documentType` field).
 */
export const CAMPAIGN_DOCUMENT_TYPES = [
  "PITCH_DECK",
  "FINANCIAL_STATEMENTS",
  "TEAM_AGREEMENT",
  "TERM_SHEET",
  "RISK_DISCLOSURE",
  "TAX_CLEARANCE",
] as const;

export type CampaignDocumentType = (typeof CAMPAIGN_DOCUMENT_TYPES)[number];
