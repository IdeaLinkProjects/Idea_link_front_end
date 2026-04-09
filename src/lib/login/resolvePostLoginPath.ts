const DEMO_ROLE_KEY = "ideal-link-demo-role";

export type PostLoginPath = "/investor" | "/innovator";

export function resolvePostLoginPath(email: string): PostLoginPath {
  const emailLower = email.trim().toLowerCase();
  const storedRole = typeof window !== "undefined" ? window.localStorage.getItem(DEMO_ROLE_KEY) : null;
  const goInvestor =
    storedRole === "investor" || emailLower.startsWith("investor@") || emailLower.includes("+investor@");
  return goInvestor ? "/investor" : "/innovator";
}
