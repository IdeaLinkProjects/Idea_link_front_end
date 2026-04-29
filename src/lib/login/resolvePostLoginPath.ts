const KYC_SKIPPED_KEY = "ideal-link-kyc-skipped";

export type PostLoginPath = "/dashboard" | "/kyc";

/** Remember that the user chose to skip KYC so login no longer redirects to /kyc. */
export function persistKycSkipped(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KYC_SKIPPED_KEY, "1");
}

export function resolveDashboardPath(_email?: string): "/dashboard" {
  void _email;
  return "/dashboard";
}

export function resolvePostLoginPath(
  email: string,
  userInfo?: { kycStatus?: string } | null,
): PostLoginPath {
  const kycStatus = userInfo?.kycStatus?.trim();
  if ((!kycStatus || kycStatus === "NOT_SUBMITTED")) {
    return "/kyc";
  }
  return resolveDashboardPath(email);
}
