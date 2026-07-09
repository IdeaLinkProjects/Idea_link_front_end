const ACCESS_TOKEN_KEY = "ideal-link-access-token";
const REFRESH_TOKEN_KEY = "ideal-link-refresh-token";
const ACCESS_TOKEN_EXPIRES_AT_KEY = "ideal-link-access-token-expires-at";

/** Default access-token lifetime when the API omits `expiresIn` and the token has no JWT `exp`. */
export const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 60 * 60;

/** Expire slightly early to avoid racing the server clock. */
const EXPIRY_SKEW_MS = 30_000;

/** Dispatched on the window when auth tokens are persisted or cleared (same-tab). */
export const AUTH_SESSION_CHANGED_EVENT = "ideal-link-auth-session-changed";

let redirectingToLogin = false;

function notifyAuthSessionChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

function readRawAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function readRawRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

/** True when an access token string is present (may be expired). */
export function hasRawAccessToken(): boolean {
  return Boolean(readRawAccessToken()?.length);
}

/** Decode JWT `exp` (seconds) → ms, or null if the token is not a JWT / has no exp. */
export function getJwtExpiryMs(token: string): number | null {
  try {
    if (typeof atob !== "function") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };
    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

function resolveExpiresAtMs(accessToken: string): number | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  if (stored) {
    const parsed = Number(stored);
    if (Number.isFinite(parsed)) return parsed;
  }

  const fromJwt = getJwtExpiryMs(accessToken);
  if (fromJwt != null) {
    window.localStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, String(fromJwt));
    return fromJwt;
  }

  // Legacy sessions (tokens stored before expiry tracking): assume 1h from first check.
  // Server 401 handling still forces logout if the token is already invalid.
  const migrated = Date.now() + DEFAULT_ACCESS_TOKEN_TTL_SECONDS * 1000;
  window.localStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, String(migrated));
  return migrated;
}

export function getAccessTokenExpiresAt(): number | null {
  const token = readRawAccessToken();
  if (!token) return null;
  return resolveExpiresAtMs(token);
}

export function isAccessTokenExpired(): boolean {
  const token = readRawAccessToken();
  if (!token?.length) return true;
  const expiresAt = resolveExpiresAtMs(token);
  if (expiresAt == null) return true;
  return Date.now() >= expiresAt - EXPIRY_SKEW_MS;
}

/**
 * Persist tokens and access-token expiry.
 * Prefers `expiresIn` (seconds) from the API, then JWT `exp`, then a 1-hour default.
 */
export function persistAuthTokens(
  accessToken: string,
  refreshToken: string,
  expiresInSeconds?: number | null,
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  const fromApi =
    typeof expiresInSeconds === "number" && Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
      ? Date.now() + expiresInSeconds * 1000
      : null;
  const fromJwt = getJwtExpiryMs(accessToken);
  const expiresAt = fromApi ?? fromJwt ?? Date.now() + DEFAULT_ACCESS_TOKEN_TTL_SECONDS * 1000;
  window.localStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, String(expiresAt));
  redirectingToLogin = false;
  notifyAuthSessionChanged();
}

export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  notifyAuthSessionChanged();
}

/**
 * Clear auth data and send the user to `/login`.
 * No-ops on the login page and avoids duplicate redirects.
 */
export function clearAuthSessionAndRedirectToLogin(): void {
  if (typeof window === "undefined") return;
  clearAuthTokens();
  if (redirectingToLogin) return;
  const path = window.location.pathname;
  if (path === "/login") return;
  redirectingToLogin = true;
  window.location.assign("/login");
}

/**
 * Returns the access token only when the session is still valid.
 * Clears expired tokens and redirects to login.
 */
export function getAccessToken(): string | null {
  const token = readRawAccessToken();
  if (!token?.length) return null;
  if (isAccessTokenExpired()) {
    clearAuthSessionAndRedirectToLogin();
    return null;
  }
  return token;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  if (isAccessTokenExpired()) {
    clearAuthSessionAndRedirectToLogin();
    return null;
  }
  return readRawRefreshToken();
}

/**
 * Both tokens must be present and the access token must not be expired.
 * Clears expired sessions as a side effect.
 */
export function hasStoredAuthTokens(): boolean {
  const access = getAccessToken();
  if (!access?.length) return false;
  const refresh = readRawRefreshToken();
  return Boolean(refresh?.length);
}

/**
 * If tokens exist but the access token is expired, clear them and redirect to login.
 * Returns true when a valid session remains.
 */
export function enforceValidAuthSession(): boolean {
  const access = readRawAccessToken();
  const refresh = readRawRefreshToken();
  if (!access?.length && !refresh?.length) return false;
  if (!access?.length || !refresh?.length || isAccessTokenExpired()) {
    clearAuthSessionAndRedirectToLogin();
    return false;
  }
  return true;
}

/** Ms until the access token should be treated as expired (after skew), or null if none. */
export function getMsUntilAccessTokenExpiry(): number | null {
  const expiresAt = getAccessTokenExpiresAt();
  if (expiresAt == null) return null;
  return Math.max(0, expiresAt - EXPIRY_SKEW_MS - Date.now());
}
