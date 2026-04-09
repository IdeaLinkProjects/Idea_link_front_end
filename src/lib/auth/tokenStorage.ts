const ACCESS_TOKEN_KEY = "ideal-link-access-token";
const REFRESH_TOKEN_KEY = "ideal-link-refresh-token";

export function persistAuthTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

/** Both tokens must be present to treat the session as authenticated for route guards. */
export function hasStoredAuthTokens(): boolean {
  const a = getAccessToken();
  const r = getRefreshToken();
  return Boolean(a?.length && r?.length);
}
