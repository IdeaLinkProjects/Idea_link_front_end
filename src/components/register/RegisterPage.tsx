import Head from "next/head";
import Link from "next/link";
import { type FormEvent, type SetStateAction, useCallback, useMemo, useState } from "react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { registerApiMessageToFieldErrors } from "@/lib/register/parseRegisterApiError";
import { createEmptyRegisterForm, type RegisterFormState } from "@/lib/register/types";
import { validateRegisterForm, type RegisterFormErrors } from "@/lib/register/validateRegisterForm";
import { messages } from "@/locales";
import { useRegisterMutation } from "@/store";
import { RegisterForm } from "./RegisterForm";
import { RegisterPromoPanel } from "./RegisterPromoPanel";
import { SuccessMessage } from "./SuccessMessage";

export function RegisterPage() {
  const { locale } = useAppPreferences();
  const t = messages[locale].registerPage;

  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();
  const [form, setFormInternal] = useState<RegisterFormState>(() => createEmptyRegisterForm());
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<RegisterFormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

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
      setSuccess(true);
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
                {t.title}
              </h1>

              {success ? (
                <SuccessMessage t={t} signInLabel={messages[locale].loginPage.signIn} />
              ) : (
                <RegisterForm
                  t={t}
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  submitted={submitted}
                  generalError={generalError}
                  isSubmitting={isRegistering}
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

export default RegisterPage;
