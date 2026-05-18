import Link from "next/link";
import { Lock, LockKeyhole } from "lucide-react";
import type { FormEvent } from "react";
import type { Dispatch, SetStateAction } from "react";
import { RegisterIconField } from "@/components/register/RegisterIconField";
import type { ResetPasswordFormErrors, ResetPasswordPageMessages } from "@/lib/reset-password/validateResetPasswordForm";
import type { ResetPasswordFormState } from "@/lib/reset-password/types";

type ResetPasswordFormProps = {
  t: ResetPasswordPageMessages;
  form: ResetPasswordFormState;
  setForm: Dispatch<SetStateAction<ResetPasswordFormState>>;
  errors: ResetPasswordFormErrors;
  submitted: boolean;
  generalError: string | null;
  isSubmitting: boolean;
  onSubmit: (ev: FormEvent<HTMLFormElement>) => void;
};

export function ResetPasswordForm({
  t,
  form,
  setForm,
  errors,
  submitted,
  generalError,
  isSubmitting,
  onSubmit,
}: ResetPasswordFormProps) {
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

      <p className="text-sm leading-snug text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>

      <RegisterIconField
        id="reset-new-password"
        label={t.newPassword}
        type="password"
        autoComplete="new-password"
        placeholder={t.newPasswordPlaceholder}
        value={form.newPassword}
        onValueChange={(newPassword) => setForm((prev) => ({ ...prev, newPassword }))}
        errorKey="password"
        errors={errors}
        submitted={submitted}
        validWhenSubmitted={form.newPassword.length >= 8}
        Icon={Lock}
        passwordToggle
        showPasswordLabel={t.showPassword}
        hidePasswordLabel={t.hidePassword}
      />

      <RegisterIconField
        id="reset-confirm-password"
        label={t.confirmPassword}
        type="password"
        autoComplete="new-password"
        placeholder={t.confirmPasswordPlaceholder}
        value={form.confirmPassword}
        onValueChange={(confirmPassword) => setForm((prev) => ({ ...prev, confirmPassword }))}
        errorKey="confirmPassword"
        errors={errors}
        submitted={submitted}
        validWhenSubmitted={form.confirmPassword.length > 0 && form.confirmPassword === form.newPassword}
        Icon={LockKeyhole}
        passwordToggle
        showPasswordLabel={t.showPassword}
        hidePasswordLabel={t.hidePassword}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary-950 py-3 text-base font-semibold text-white shadow-lg shadow-primary-950/40 transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? t.resetting : t.resetPassword}
      </button>

      <p className="border-t border-zinc-100 pt-6 text-center text-xs leading-tight text-zinc-600 dark:border-white/10 dark:text-zinc-400">
        <Link href="/login" className="font-semibold text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
          {t.backToLogin}
        </Link>
      </p>
    </form>
  );
}
