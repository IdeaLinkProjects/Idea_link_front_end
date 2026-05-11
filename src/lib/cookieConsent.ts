/** Persisted when the user accepts non-essential cookies / analytics from the banner. */
export const COOKIE_CONSENT_STORAGE_KEY = "ideal_link_cookie_consent_v1";

export function hasCookieConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function setCookieConsentAccepted(): void {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "accepted");
  } catch {
    /* ignore quota / private mode */
  }
}
