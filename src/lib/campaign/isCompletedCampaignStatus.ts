export function isCompletedCampaignStatus(status: string): boolean {
  const normalized = status.trim().toUpperCase();
  return normalized === "FUNDED" || normalized === "FUNDS_RELEASED" || normalized === "COMPLETED";
}
