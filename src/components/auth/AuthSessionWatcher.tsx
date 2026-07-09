import { useEffect } from "react";
import {
  AUTH_SESSION_CHANGED_EVENT,
  clearAuthSessionAndRedirectToLogin,
  enforceValidAuthSession,
  getMsUntilAccessTokenExpiry,
} from "@/lib/auth/tokenStorage";

/**
 * Watches the access-token lifetime and forces logout + redirect when it expires.
 * Mount once near the app root.
 */
export function AuthSessionWatcher() {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const armExpiryTimer = () => {
      if (timeoutId != null) clearTimeout(timeoutId);
      timeoutId = undefined;

      if (!enforceValidAuthSession()) return;

      const ms = getMsUntilAccessTokenExpiry();
      if (ms == null) {
        clearAuthSessionAndRedirectToLogin();
        return;
      }

      timeoutId = setTimeout(() => {
        clearAuthSessionAndRedirectToLogin();
      }, ms);
    };

    armExpiryTimer();

    const onVisibility = () => {
      if (document.visibilityState === "visible") armExpiryTimer();
    };

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === "ideal-link-access-token" ||
        event.key === "ideal-link-refresh-token" ||
        event.key === "ideal-link-access-token-expires-at" ||
        event.key === null
      ) {
        armExpiryTimer();
      }
    };

    const onSessionChanged = () => armExpiryTimer();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, onSessionChanged);

    return () => {
      if (timeoutId != null) clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, onSessionChanged);
    };
  }, []);

  return null;
}
