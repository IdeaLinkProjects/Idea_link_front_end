const REMEMBER_EMAIL_KEY = "ideal-link-remember-email";

export function readRememberedEmail(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
}

export function persistRememberedEmail(email: string, remember: boolean): void {
  if (typeof window === "undefined") return;
  const trimmed = email.trim();
  if (remember && trimmed) {
    window.localStorage.setItem(REMEMBER_EMAIL_KEY, trimmed);
  } else {
    window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
  }
}
