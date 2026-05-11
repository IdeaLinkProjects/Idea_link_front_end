import Link from "next/link";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { COOKIE_CONSENT_STORAGE_KEY, setCookieConsentAccepted } from "@/lib/cookieConsent";
import { messages } from "@/locales";
import { useCallback, useEffect, useState } from "react";

export function CookieConsentBanner() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].cookieConsent;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === "accepted") return;
      queueMicrotask(() => setOpen(true));
    } catch {
      queueMicrotask(() => setOpen(true));
    }
  }, []);

  const accept = useCallback(() => {
    setCookieConsentAccepted();
    setOpen(false);
  }, []);

  if (!open) return null;

  const panel = isDark
    ? "border-white/15 bg-zinc-900/95 text-zinc-100 shadow-2xl shadow-black/40 ring-1 ring-white/10"
    : "border-zinc-200 bg-white text-zinc-900 shadow-2xl shadow-zinc-900/10 ring-1 ring-zinc-900/[0.04]";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center p-4 sm:p-5"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div
        className={`pointer-events-auto flex w-full max-w-screen-lg flex-col gap-4 rounded-2xl border p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5 ${panel}`}
      >
        <div className="min-w-0 flex-1 space-y-2">
          <p id="cookie-consent-title" className="text-sm font-bold sm:text-base">
            {t.title}
          </p>
          <p id="cookie-consent-desc" className={`text-xs leading-relaxed sm:text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            {t.body}{" "}
            <Link href="/privacy" className={`font-semibold underline-offset-2 hover:underline ${isDark ? "text-primary-300" : "text-primary-700"}`}>
              {t.privacyLink}
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={accept}
            className="rounded-xl bg-primary-600 px-5 py-2.5 text-center text-sm font-bold text-white shadow-md shadow-primary-900/20 transition hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
