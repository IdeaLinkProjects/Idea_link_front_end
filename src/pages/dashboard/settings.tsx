import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { type AppTheme, useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import type { Locale } from "@/locales";
import { messages } from "@/locales";
import { useForgotPasswordMutation, useGetUserRolesStatusQuery } from "@/store";

const NOTIFY_EMAIL_KEY = "ideal-link-settings-notify-email";
const NOTIFY_MSG_KEY = "ideal-link-settings-notify-messages";

function readBool(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  const s = localStorage.getItem(key);
  if (s === "1") return true;
  if (s === "0") return false;
  return fallback;
}

function ToggleRow({
  label,
  hint,
  checked,
  onCheckedChange,
  isDark,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  isDark: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-b py-4 last:border-b-0 last:pb-0 first:pt-0 ${
        isDark ? "border-white/10" : "border-zinc-200"
      }`}
    >
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{label}</p>
        <p className={`mt-0.5 text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 ${
          checked ? "bg-primary-600" : isDark ? "bg-zinc-600" : "bg-zinc-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function DashboardSettingsPage() {
  const { locale, setLocale, theme, setTheme, isDark } = useAppPreferences();
  const t = messages[locale].settingsPage;

  const { data: profile } = useGetUserRolesStatusQuery();
  const [forgotPassword, { isLoading: isResettingPassword }] = useForgotPasswordMutation();

  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);
  const [resetSuccessOpen, setResetSuccessOpen] = useState(false);

  useEffect(() => {
    setNotifyEmail(readBool(NOTIFY_EMAIL_KEY, true));
    setNotifyMessages(readBool(NOTIFY_MSG_KEY, true));
  }, []);

  const persistBool = useCallback((key: string, value: boolean) => {
    try {
      localStorage.setItem(key, value ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const onEmail = useCallback(
    (next: boolean) => {
      setNotifyEmail(next);
      persistBool(NOTIFY_EMAIL_KEY, next);
    },
    [persistBool],
  );

  const onMessages = useCallback(
    (next: boolean) => {
      setNotifyMessages(next);
      persistBool(NOTIFY_MSG_KEY, next);
    },
    [persistBool],
  );

  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";

  const switchCardClass = isDark
    ? "flex h-full flex-col rounded-2xl border border-white/15 bg-zinc-900/40 p-5 shadow-inner shadow-black/20"
    : "flex h-full flex-col rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50/90 p-5 shadow-sm";

  const segmentBase =
    "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950";
  const segmentInactive = isDark
    ? "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900";
  const segmentActive = isDark ? "bg-primary-900/60 text-primary-100 shadow-sm" : "bg-primary-100 text-primary-900 shadow-sm";

  const setLang = (value: Locale) => () => setLocale(value);
  const setTh = (value: AppTheme) => () => setTheme(value);

  const onResetPassword = useCallback(async () => {
    setResetPasswordError(null);
    const email = profile?.email?.trim();
    if (!email) {
      setResetPasswordError(t.resetPasswordNoEmail);
      return;
    }
    try {
      await forgotPassword({ email }).unwrap();
      setResetSuccessOpen(true);
    } catch (err) {
      setResetPasswordError(extractApiErrorMessage(err, t.resetPasswordError));
    }
  }, [forgotPassword, profile?.email, t]);

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardLayout>
        <div className="mx-auto w-full max-w-6xl space-y-10">
          <DashboardPageHeader title={t.title} subtitle={t.subtitle} />

          <section>
            <h2 className={`mb-4 text-sm font-bold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
              {t.sectionAppearance}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={switchCardClass}>
                <div className="mb-4 flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDark ? "bg-primary-900/50 text-primary-300" : "bg-primary-100 text-primary-800"}`}
                    aria-hidden
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                  </span>
                  <div>
                    <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.languageTitle}</h3>
                    <p className={`mt-1 text-xs leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                      {t.languageDescription}
                    </p>
                  </div>
                </div>
                <div
                  className={`mt-auto flex gap-1.5 rounded-xl border p-1 ${isDark ? "border-white/10 bg-black/20" : "border-zinc-200 bg-zinc-100/80"}`}
                  role="group"
                  aria-label={t.languageTitle}
                >
                  <button
                    type="button"
                    onClick={setLang("en")}
                    className={`${segmentBase} ${locale === "en" ? segmentActive : segmentInactive}`}
                  >
                    {t.langEn}
                  </button>
                  <button
                    type="button"
                    onClick={setLang("am")}
                    className={`${segmentBase} ${locale === "am" ? segmentActive : segmentInactive}`}
                  >
                    {t.langAm}
                  </button>
                </div>
              </div>

              <div className={switchCardClass}>
                <div className="mb-4 flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDark ? "bg-primary-900/50 text-primary-300" : "bg-primary-100 text-primary-800"}`}
                    aria-hidden
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                  </span>
                  <div>
                    <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.themeTitle}</h3>
                    <p className={`mt-1 text-xs leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                      {t.themeDescription}
                    </p>
                  </div>
                </div>
                <div
                  className={`mt-auto flex gap-1.5 rounded-xl border p-1 ${isDark ? "border-white/10 bg-black/20" : "border-zinc-200 bg-zinc-100/80"}`}
                  role="group"
                  aria-label={t.themeTitle}
                >
                  <button
                    type="button"
                    onClick={setTh("light")}
                    className={`${segmentBase} ${theme === "light" ? segmentActive : segmentInactive}`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    {t.themeLight}
                  </button>
                  <button
                    type="button"
                    onClick={setTh("dark")}
                    className={`${segmentBase} ${theme === "dark" ? segmentActive : segmentInactive}`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                    {t.themeDark}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className={`mb-4 text-sm font-bold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
              {t.sectionSecurity}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={`rounded-2xl border p-5 sm:col-span-2 ${cardClass}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDark ? "bg-primary-900/50 text-primary-300" : "bg-primary-100 text-primary-800"}`}
                      aria-hidden
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.resetPasswordTitle}</h3>
                      <p className={`mt-1 text-xs leading-relaxed sm:max-w-xl ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                        {t.resetPasswordDescription}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                    <button
                      type="button"
                      onClick={() => void onResetPassword()}
                      disabled={isResettingPassword}
                      className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-zinc-950"
                    >
                      {isResettingPassword ? t.resetPasswordSending : t.resetPasswordCta}
                    </button>
                    {resetPasswordError ? (
                      <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                        {resetPasswordError}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <AlertDialog
          open={resetSuccessOpen}
          title={t.resetPasswordSuccessTitle}
          description={t.resetPasswordSuccessMessage}
          okLabel={t.resetPasswordOk}
          onClose={() => setResetSuccessOpen(false)}
          isDark={isDark}
        />
      </DashboardLayout>
    </>
  );
}
