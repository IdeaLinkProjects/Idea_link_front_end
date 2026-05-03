/** Backend KYC lifecycle values for users / role prerequisites. */
export const KYC_STATUS = {
  NOT_SUBMITTED: "NOT_SUBMITTED",
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
} as const;

export type KycStatusValue = (typeof KYC_STATUS)[keyof typeof KYC_STATUS];

/**
 * Merge innovator and investor prerequisite KYC flags into one account-level status.
 * NOT_SUBMITTED wins over PENDING; PENDING wins over VERIFIED.
 */
export function resolveAccountKycStatus(
  innovatorKyc: string | null | undefined,
  investorKyc: string | null | undefined,
): string {
  const a = innovatorKyc?.trim();
  const b = investorKyc?.trim();
  const present = [a, b].filter((s): s is string => Boolean(s));
  if (present.some((s) => s === KYC_STATUS.NOT_SUBMITTED)) return KYC_STATUS.NOT_SUBMITTED;
  if (present.some((s) => s === KYC_STATUS.PENDING)) return KYC_STATUS.PENDING;
  if (present.length > 0 && present.every((s) => s === KYC_STATUS.VERIFIED)) return KYC_STATUS.VERIFIED;
  if (!present.length) return KYC_STATUS.NOT_SUBMITTED;
  return KYC_STATUS.PENDING;
}
