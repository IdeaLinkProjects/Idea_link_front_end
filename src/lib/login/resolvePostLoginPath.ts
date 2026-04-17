const DEMO_ROLE_KEY = "ideal-link-demo-role";

export type PostLoginPath = "/investor" | "/innovator" | "/kyc";

export function resolvePostLoginPath(
  email: string,
  userInfo?: { kycStatus?: string } | null,
): PostLoginPath {
  const kycStatus = userInfo?.kycStatus?.trim();
  if (!kycStatus || kycStatus === "NOT_SUBMITTED") {
    return "/kyc";
  }
  const emailLower = email.trim().toLowerCase();
  const storedRole = typeof window !== "undefined" ? window.localStorage.getItem(DEMO_ROLE_KEY) : null;
  const goInvestor =
    storedRole === "investor" || emailLower.startsWith("investor@") || emailLower.includes("+investor@");
  return goInvestor ? "/investor" : "/innovator";
}
