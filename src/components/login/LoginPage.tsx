import Head from "next/head";
import { useRouter } from "next/router";
import { type FormEvent, type SetStateAction, useCallback, useMemo, useState } from "react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { persistAuthTokens } from "@/lib/auth/tokenStorage";
import { createInitialLoginForm, type LoginFormState } from "@/lib/login/types";
import { persistRememberedEmail } from "@/lib/login/rememberEmailStorage";
import { resolvePostLoginPath } from "@/lib/login/resolvePostLoginPath";
import { validateLoginForm } from "@/lib/login/validateLoginForm";
import { messages } from "@/locales";
import { useLoginMutation } from "@/store";
import { RegisterPromoPanel } from "@/components/register/RegisterPromoPanel";
import { IdealLinkLogo } from "@/components/brand/IdealLinkLogo";
import { LoginForm } from "./LoginForm";

export function LoginPage() {
  const router = useRouter();
  const { locale } = useAppPreferences();
  const t = messages[locale].loginPage;
  const registerPromo = messages[locale].registerPage;

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [form, setFormInternal] = useState<LoginFormState>(() => createInitialLoginForm());
  const [submitted, setSubmitted] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const setForm = useCallback(
    (updater: SetStateAction<LoginFormState>) => {
      setGeneralError(null);
      setFormInternal(updater);
    },
    [],
  );

  const errors = useMemo(() => {
    if (!submitted) return {};
    return validateLoginForm(form.email, form.password, t);
  }, [submitted, form.email, form.password, t]);

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setGeneralError(null);
    const nextErrors = validateLoginForm(form.email, form.password, t);
    setSubmitted(true);
    if (Object.keys(nextErrors).length > 0) return;

    const email = form.email.trim();
    try {
      const data = await login({ email, password: form.password }).unwrap();
      const access = data.accessToken?.trim();
      const refresh = data.refreshToken?.trim();
      if (access && refresh) {
        persistAuthTokens(access, refresh, data.expiresIn);
        persistRememberedEmail(form.email, form.remember);
        void router.push(resolvePostLoginPath(email, data.userInfo));
        return;
      }
      setGeneralError(t.registerOrVerifyHint);
    } catch (err) {
      const message = extractApiErrorMessage(err, "Sign in failed. Please try again.");
      setGeneralError(message);
    }
  };

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

              <LoginForm
                t={t}
                form={form}
                setForm={setForm}
                errors={errors}
                submitted={submitted}
                generalError={generalError}
                isSubmitting={isLoggingIn}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
