import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FormEvent, type SetStateAction, useCallback, useMemo, useState } from "react";
import { IdealLinkLogo } from "@/components/brand/IdealLinkLogo";
import { RegisterPromoPanel } from "@/components/register/RegisterPromoPanel";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { createEmptyResetPasswordForm } from "@/lib/reset-password/types";
import { validateResetPasswordForm } from "@/lib/reset-password/validateResetPasswordForm";
import { messages } from "@/locales";
import { useResetPasswordMutation } from "@/store";
import { ResetPasswordForm } from "./ResetPasswordForm";

type ResetPhase = "form" | "success" | "invalid";

export function ResetPasswordPage() {
  const router = useRouter();
  const { locale } = useAppPreferences();
  const t = messages[locale].resetPasswordPage;
  const registerPromo = messages[locale].registerPage;

  const resetToken = typeof router.query.token === "string" ? router.query.token.trim() : "";
  const tokenReady = router.isReady;

  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  const [form, setFormInternal] = useState(createEmptyResetPasswordForm);
  const [phase, setPhase] = useState<ResetPhase>("form");
  const [submitted, setSubmitted] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const setForm = useCallback((updater: SetStateAction<typeof form>) => {
    setGeneralError(null);
    setFormInternal(updater);
  }, []);

  const errors = useMemo(() => {
    if (!submitted) return {};
    return validateResetPasswordForm(form, t);
  }, [submitted, form, t]);

  const resolvedPhase: ResetPhase = useMemo(() => {
    if (!tokenReady) return "form";
    if (!resetToken) return "invalid";
    return phase;
  }, [tokenReady, resetToken, phase]);

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setGeneralError(null);
    const nextErrors = validateResetPasswordForm(form, t);
    setSubmitted(true);
    if (Object.keys(nextErrors).length > 0) return;
    if (!resetToken) return;

    try {
      await resetPassword({
        resetToken,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      }).unwrap();
      setPhase("success");
    } catch (err) {
      setGeneralError(extractApiErrorMessage(err, t.errors.submitFailed));
    }
  };

  const heading =
    resolvedPhase === "success" ? t.successTitle : resolvedPhase === "invalid" ? t.invalidTokenTitle : t.title;

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex min-h-dvh flex-col bg-zinc-100 text-zinc-900 max-lg:overflow-y-auto dark:bg-zinc-950 dark:text-zinc-100 lg:h-dvh lg:max-h-dvh lg:overflow-hidden">
        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col lg:max-w-none lg:flex-row xl:max-w-[1400px]">
          <RegisterPromoPanel t={registerPromo} className="order-2 w-full shrink-0 lg:order-1 lg:min-h-0 lg:w-1/2 xl:w-[46%]" />

          <div className="order-1 flex min-h-0 w-full flex-1 flex-col justify-center px-4 py-6 sm:px-6 lg:order-2 lg:w-1/2 lg:px-8 lg:py-5 xl:w-[54%] xl:px-10">
            <div className="mx-auto w-full max-w-[22rem] sm:max-w-md">
              <div className="text-center lg:text-left">
                <IdealLinkLogo className="inline-flex items-center transition hover:opacity-90" width={300} height={82} imageClassName="h-16 w-auto sm:h-20" priority />
              </div>

              <h1 className="mt-2 text-center text-lg font-bold tracking-tight text-zinc-900 sm:text-xl lg:text-left dark:text-white">
                {heading}
              </h1>

              {!tokenReady ? (
                <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-xl dark:border-white/15 dark:bg-white/10 dark:text-zinc-400 sm:p-5">
                  {t.loading}
                </div>
              ) : resolvedPhase === "invalid" ? (
                <div className="mt-3 space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl shadow-zinc-300/50 dark:border-white/15 dark:bg-white/10 dark:shadow-black/30 sm:p-5">
                  <p className="text-sm leading-snug text-zinc-600 dark:text-zinc-400">{t.invalidTokenBody}</p>
                  <Link
                    href="/login"
                    className="inline-flex w-full justify-center rounded-lg bg-primary-950 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-950/40 transition hover:bg-primary-900"
                  >
                    {t.backToLogin}
                  </Link>
                </div>
              ) : resolvedPhase === "success" ? (
                <div className="mt-3 flex flex-col rounded-xl border border-zinc-200 bg-white p-4 text-center text-sm shadow-xl shadow-zinc-300/50 dark:border-white/15 dark:bg-white/10 dark:shadow-black/30 sm:p-5 lg:text-left">
                  <p className="font-semibold text-primary-800 dark:text-primary-300">{t.successTitle}</p>
                  <p className="mt-1.5 text-xs leading-snug text-zinc-600 dark:text-zinc-400">{t.successBody}</p>
                  <Link
                    href="/login"
                    className="mt-4 inline-flex justify-center rounded-lg bg-primary-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-950/40 transition hover:bg-primary-900 lg:self-start"
                  >
                    {t.signIn}
                  </Link>
                </div>
              ) : (
                <ResetPasswordForm
                  t={t}
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  submitted={submitted}
                  generalError={generalError}
                  isSubmitting={isResetting}
                  onSubmit={handleSubmit}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResetPasswordPage;
