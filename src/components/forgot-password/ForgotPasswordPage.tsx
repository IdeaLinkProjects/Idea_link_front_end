import Head from "next/head";
import { useRouter } from "next/router";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { IdealLinkLogo } from "@/components/brand/IdealLinkLogo";
import { RegisterPromoPanel } from "@/components/register/RegisterPromoPanel";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { validateForgotPasswordForm } from "@/lib/forgot-password/validateForgotPasswordForm";
import { messages } from "@/locales";
import { useForgotPasswordMutation } from "@/store";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export function ForgotPasswordPage() {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].forgotPasswordPage;
  const registerPromo = messages[locale].registerPage;

  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const fromQuery = typeof router.query.email === "string" ? router.query.email.trim() : "";
    if (fromQuery) setEmail(fromQuery);
  }, [router.isReady, router.query.email]);

  const setEmailValue = useCallback((value: string) => {
    setGeneralError(null);
    setEmail(value);
  }, []);

  const errors = useMemo(() => {
    if (!submitted) return {};
    return validateForgotPasswordForm(email, t);
  }, [submitted, email, t]);

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setGeneralError(null);
    const nextErrors = validateForgotPasswordForm(email, t);
    setSubmitted(true);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      setSuccessOpen(true);
    } catch (err) {
      setGeneralError(extractApiErrorMessage(err, t.errors.submitFailed));
    }
  };

  const handleSuccessClose = useCallback(() => {
    setSuccessOpen(false);
    void router.push("/login");
  }, [router]);

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
                {t.title}
              </h1>

              <ForgotPasswordForm
                t={t}
                email={email}
                onEmailChange={setEmailValue}
                errors={errors}
                submitted={submitted}
                generalError={generalError}
                isSubmitting={isSending}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={successOpen}
        title={t.successTitle}
        description={t.successMessage}
        okLabel={t.ok}
        onClose={handleSuccessClose}
        isDark={isDark}
      />
    </>
  );
}

export default ForgotPasswordPage;
