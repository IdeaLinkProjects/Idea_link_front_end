import Link from "next/link";
import type { FormEvent } from "react";
import type { Dispatch, SetStateAction } from "react";
import { registerPlainInputClass } from "@/components/register/fieldClasses";
import type { RegisterFormState } from "@/lib/register/types";
import type { RegisterFormErrors, RegisterPageMessages } from "@/lib/register/validateRegisterForm";
import { RegisterAccountFields } from "@/components/register/RegisterAccountFields";

export type RegisterPhase = "register" | "verify";

type RegisterFormProps = {
  t: RegisterPageMessages;
  phase: RegisterPhase;
  form: RegisterFormState;
  setForm: Dispatch<SetStateAction<RegisterFormState>>;
  errors: RegisterFormErrors;
  submitted: boolean;
  generalError: string | null;
  isSubmitting: boolean;
  onSubmit: (ev: FormEvent<HTMLFormElement>) => void;
  otpCode: string;
  setOtpCode: Dispatch<SetStateAction<string>>;
  verifySubmitted: boolean;
  otpError: string | undefined;
  verifyGeneralError: string | null;
  isVerifying: boolean;
  onVerifySubmit: (ev: FormEvent<HTMLFormElement>) => void;
};

export function RegisterForm({
  t,
  phase,
  form,
  setForm,
  errors,
  submitted,
  generalError,
  isSubmitting,
  onSubmit,
  otpCode,
  setOtpCode,
  verifySubmitted,
  otpError,
  verifyGeneralError,
  isVerifying,
  onVerifySubmit,
}: RegisterFormProps) {
  if (phase === "verify") {
    return (
      <form
        onSubmit={onVerifySubmit}
        className="mt-3 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl shadow-zinc-300/50 backdrop-blur-md dark:border-white/15 dark:bg-white/10 dark:shadow-black/30 sm:p-5"
        noValidate
      >
        {verifyGeneralError ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-snug text-red-800 dark:border-red-400/40 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {verifyGeneralError}
          </div>
        ) : null}

        <p className="text-sm leading-snug text-zinc-600 dark:text-zinc-400">
          {t.verifyBody.replace("{email}", form.email.trim())}
        </p>

        <div>
          <label htmlFor="register-otp" className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {t.otpLabel}
          </label>
          <input
            id="register-otp"
            name="otpCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
            placeholder={t.otpPlaceholder}
            className={registerPlainInputClass(verifySubmitted, otpError, otpCode.length > 0)}
            aria-invalid={verifySubmitted && !!otpError}
          />
          {otpError ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
              {otpError}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className="w-full rounded-lg bg-primary-950 py-3 text-base font-semibold text-white shadow-lg shadow-primary-950/40 transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isVerifying ? t.verifying : t.verifySubmit}
        </button>

        <p className="text-center text-xs leading-tight text-zinc-600 dark:text-zinc-400">
          {t.alreadyHave}{" "}
          <Link
            href="/login"
            className="font-semibold text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {t.loginHere}
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-3 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl shadow-zinc-300/50 backdrop-blur-md dark:border-white/15 dark:bg-white/10 dark:shadow-black/30 sm:p-5"
      noValidate
    >
      {generalError ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-snug text-red-800 dark:border-red-400/40 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {generalError}
        </div>
      ) : null}

      <RegisterAccountFields t={t} form={form} setForm={setForm} errors={errors} submitted={submitted} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary-950 py-3 text-base font-semibold text-white shadow-lg shadow-primary-950/40 transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? t.creatingAccount : t.createAccount}
      </button>

      <p className="text-center text-xs leading-tight text-zinc-600 dark:text-zinc-400">
        {t.alreadyHave}{" "}
        <Link href="/login" className="font-semibold text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
          {t.loginHere}
        </Link>
      </p>
    </form>
  );
}
