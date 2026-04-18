const DEMO_ROLE_KEY = "ideal-link-demo-role";
const KYC_SKIPPED_KEY = "ideal-link-kyc-skipped";

export type PostLoginPath = "/investor" | "/innovator" | "/kyc";

function readKycSkipped(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KYC_SKIPPED_KEY) === "1";
}

/** Remember that the user chose to skip KYC so login no longer redirects to /kyc. */
export function persistKycSkipped(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KYC_SKIPPED_KEY, "1");
}

export function resolveDashboardPath(email: string): "/investor" | "/innovator" {
  const emailLower = email.trim().toLowerCase();
  const storedRole = typeof window !== "undefined" ? window.localStorage.getItem(DEMO_ROLE_KEY) : null;
  const goInvestor =
    storedRole === "investor" || emailLower.startsWith("investor@") || emailLower.includes("+investor@");
  return goInvestor ? "/investor" : "/innovator";
}

export function resolvePostLoginPath(
  email: string,
  userInfo?: { kycStatus?: string } | null,
): PostLoginPath {
  const kycStatus = userInfo?.kycStatus?.trim();
  if ((!kycStatus || kycStatus === "NOT_SUBMITTED") && !readKycSkipped()) {
    return "/kyc";
  }
  return resolveDashboardPath(email);
}
