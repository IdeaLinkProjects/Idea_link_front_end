import Link from "next/link";
import type { FormEvent } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { RegisterFormState } from "@/lib/register/types";
import type { RegisterFormErrors, RegisterPageMessages } from "@/lib/register/validateRegisterForm";
import { RegisterAccountFields } from "@/components/register/RegisterAccountFields";

type RegisterFormProps = {
  t: RegisterPageMessages;
  form: RegisterFormState;
  setForm: Dispatch<SetStateAction<RegisterFormState>>;
  errors: RegisterFormErrors;
  submitted: boolean;
  generalError: string | null;
  isSubmitting: boolean;
  onSubmit: (ev: FormEvent<HTMLFormElement>) => void;
};

export function RegisterForm({
  t,
  form,
  setForm,
  errors,
  submitted,
  generalError,
  isSubmitting,
  onSubmit,
}: RegisterFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-3 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl shadow-zinc-300/50 backdrop-blur-md dark:border-white/15 dark:bg-white/10 dark:shadow-black/30 sm:p-5"
      noValidate
    >
      {generalError ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] leading-snug text-red-800 dark:border-red-400/40 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {generalError}
        </div>
      ) : null}

      <RegisterAccountFields t={t} form={form} setForm={setForm} errors={errors} submitted={submitted} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? t.creatingAccount : t.createAccount}
      </button>

      <p className="text-center text-[11px] leading-tight text-zinc-600 dark:text-zinc-400">
        {t.alreadyHave}{" "}
        <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
          {t.loginHere}
        </Link>
      </p>
    </form>
  );
}
