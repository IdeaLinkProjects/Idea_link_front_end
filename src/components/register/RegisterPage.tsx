import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FormEvent, type SetStateAction, useCallback, useMemo, useState } from "react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { persistAuthTokens } from "@/lib/auth/tokenStorage";
import { resolvePostLoginPath } from "@/lib/login/resolvePostLoginPath";
import { registerApiMessageToFieldErrors } from "@/lib/register/parseRegisterApiError";
import { createEmptyRegisterForm, type RegisterFormState } from "@/lib/register/types";
import { validateRegisterForm, type RegisterFormErrors } from "@/lib/register/validateRegisterForm";
import { messages } from "@/locales";
import { useRegisterMutation, useVerifyEmailMutation } from "@/store";
import { RegisterForm, type RegisterPhase } from "./RegisterForm";
import { RegisterPromoPanel } from "./RegisterPromoPanel";

const OTP_REGEX = /^\d{4,8}$/;

export function RegisterPage() {
  const router = useRouter();
  const { locale } = useAppPreferences();
  const t = messages[locale].registerPage;

  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [form, setFormInternal] = useState<RegisterFormState>(() => createEmptyRegisterForm());
  const [phase, setPhase] = useState<RegisterPhase>("register");
  const [otpCode, setOtpCode] = useState("");
  const [verifySubmitted, setVerifySubmitted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<RegisterFormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [verifyGeneralError, setVerifyGeneralError] = useState<string | null>(null);

  const clearApiErrors = useCallback(() => {
    setServerFieldErrors({});
    setGeneralError(null);
  }, []);

  const setForm = useCallback(
    (updater: SetStateAction<RegisterFormState>) => {
      clearApiErrors();
      setFormInternal(updater);
    },
    [clearApiErrors],
  );

  const clientErrorsVisible = useMemo(
    () => (submitted ? validateRegisterForm(form, t) : {}),
    [submitted, form, t],
  );
  const errors = useMemo(
    () => ({ ...serverFieldErrors, ...clientErrorsVisible }),
    [serverFieldErrors, clientErrorsVisible],
  );

  const otpError = useMemo(() => {
    if (!verifySubmitted) return undefined;
    const c = otpCode.trim();
    if (!c) return t.errors.otpRequired;
    if (!OTP_REGEX.test(c)) return t.errors.otpInvalid;
    return undefined;
  }, [verifySubmitted, otpCode, t]);

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    clearApiErrors();
    setSubmitted(true);

    const nextClientErrors = validateRegisterForm(form, t);
    if (Object.keys(nextClientErrors).length > 0) return;

    try {
      await registerUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\s/g, ""),
        password: form.password,
        confirmPassword: form.confirmPassword,
      }).unwrap();
      setVerifyGeneralError(null);
      setVerifySubmitted(false);
      setOtpCode("");
      setPhase("verify");
    } catch (err) {
      const message = extractApiErrorMessage(err, "Registration failed. Please try again.");
      const { fieldErrors, generalMessage } = registerApiMessageToFieldErrors(message);
      if (Object.keys(fieldErrors).length > 0) {
        setServerFieldErrors(fieldErrors);
        setGeneralError(generalMessage);
      } else {
        setGeneralError(message);
      }
    }
  };

  const handleVerifySubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setVerifyGeneralError(null);
    const c = otpCode.trim();
    let nextOtpError: string | undefined;
    if (!c) nextOtpError = t.errors.otpRequired;
    else if (!OTP_REGEX.test(c)) nextOtpError = t.errors.otpInvalid;
    setVerifySubmitted(true);
    if (nextOtpError) return;

    const email = form.email.trim();
    try {
      const auth = await verifyEmail({
        email,
        otpCode: otpCode.trim(),
      }).unwrap();
      persistAuthTokens(auth.accessToken, auth.refreshToken);
      void router.push(resolvePostLoginPath(email));
    } catch (err) {
      const message = extractApiErrorMessage(err, "Verification failed. Please try again.");
      setVerifyGeneralError(message);
    }
  };

  const heading = phase === "verify" ? t.verifyTitle : t.title;

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex min-h-dvh flex-col bg-zinc-100 text-zinc-900 max-lg:overflow-y-auto dark:bg-zinc-950 dark:text-zinc-100 lg:h-dvh lg:max-h-dvh lg:overflow-hidden">
        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col lg:max-w-none lg:flex-row xl:max-w-[1400px]">
          <RegisterPromoPanel t={t} className="order-2 w-full shrink-0 lg:order-1 lg:min-h-0 lg:w-1/2 xl:w-[46%]" />

          <div className="order-1 flex min-h-0 w-full flex-1 flex-col justify-center px-4 py-6 sm:px-6 lg:order-2 lg:w-1/2 lg:px-8 lg:py-5 xl:w-[54%] xl:px-10">
            <div className="mx-auto w-full max-w-[22rem] sm:max-w-md">
              <div className="text-center lg:text-left">
                <Link href="/" className="inline-block text-xl font-extrabold tracking-tight transition hover:opacity-90 sm:text-2xl">
                  <span className="text-emerald-500">Ideal</span>
                  <span className="text-emerald-300">Link</span>
                </Link>
              </div>

              <h1 className="mt-2 text-center text-lg font-bold tracking-tight text-zinc-900 sm:text-xl lg:text-left dark:text-white">
                {heading}
              </h1>

              <RegisterForm
                t={t}
                phase={phase}
                form={form}
                setForm={setForm}
                errors={errors}
                submitted={submitted}
                generalError={generalError}
                isSubmitting={isRegistering}
                onSubmit={handleSubmit}
                otpCode={otpCode}
                setOtpCode={setOtpCode}
                verifySubmitted={verifySubmitted}
                otpError={otpError}
                verifyGeneralError={verifyGeneralError}
                isVerifying={isVerifying}
                onVerifySubmit={handleVerifySubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
