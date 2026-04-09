import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { type Dispatch, type FormEvent, type SetStateAction, useState } from "react";
import {
  registerIconInputClass,
  registerIconMutedClass,
  registerLabelClass,
} from "@/components/register/fieldClasses";
import type { LoginFormErrors, LoginPageMessages } from "@/lib/login/validateLoginForm";
import type { LoginFormState } from "@/lib/login/types";
import { emailOk } from "@/lib/register/email";

type LoginFormProps = {
  t: LoginPageMessages;
  form: LoginFormState;
  setForm: Dispatch<SetStateAction<LoginFormState>>;
  errors: LoginFormErrors;
  submitted: boolean;
  onSubmit: (ev: FormEvent<HTMLFormElement>) => void;
};

export function LoginForm({ t, form, setForm, errors, submitted, onSubmit }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const emailErr = errors.email;
  const passwordErr = errors.password;

  const toggleBtnClass =
    "absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 outline-none transition hover:bg-zinc-100 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:text-zinc-500 dark:hover:bg-white/10 dark:hover:text-zinc-200";

  return (
    <form
      onSubmit={onSubmit}
      className="mt-3 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl shadow-zinc-300/50 backdrop-blur-md dark:border-white/15 dark:bg-white/10 dark:shadow-black/30 sm:p-5"
      noValidate
    >
      <div>
        <label htmlFor="login-email" className={`mb-1 block text-xs font-medium ${registerLabelClass()}`}>
          {t.email}
        </label>
        <div className="relative">
          <Mail
            className={`pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 ${registerIconMutedClass()}`}
            aria-hidden
            strokeWidth={2}
          />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder={t.emailPlaceholder}
            className={registerIconInputClass(submitted, emailErr, emailOk(form.email))}
          />
        </div>
        {submitted && emailErr ? <p className="mt-0.5 text-[11px] leading-tight text-red-400">{emailErr}</p> : null}
      </div>

      <div>
        <label htmlFor="login-password" className={`mb-1 block text-xs font-medium ${registerLabelClass()}`}>
          {t.password}
        </label>
        <div className="relative">
          <Lock
            className={`pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 ${registerIconMutedClass()}`}
            aria-hidden
            strokeWidth={2}
          />
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder={t.passwordPlaceholder}
            className={registerIconInputClass(submitted, passwordErr, form.password.length > 0, {
              trailingToggle: true,
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className={toggleBtnClass}
            aria-label={showPassword ? t.hidePassword : t.showPassword}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={2} aria-hidden /> : <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />}
          </button>
        </div>
        {submitted && passwordErr ? <p className="mt-0.5 text-[11px] leading-tight text-red-400">{passwordErr}</p> : null}
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-[11px] leading-tight text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          checked={form.remember}
          onChange={(e) => setForm((prev) => ({ ...prev, remember: e.target.checked }))}
          className="h-4 w-4 rounded border-zinc-500 bg-transparent text-emerald-600 focus:ring-emerald-600"
        />
        <span>{t.rememberMe}</span>
      </label>

      <button
        type="submit"
        className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-600"
      >
        {t.signIn}
      </button>

      <div className="text-center">
        <Link href="/forgot-password" className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
          {t.forgotPassword}
        </Link>
      </div>

      <p className="border-t border-zinc-100 pt-6 text-center text-[11px] leading-tight text-zinc-600 dark:border-white/10 dark:text-zinc-400">
        {t.noAccount}{" "}
        <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
          {t.registerHere}
        </Link>
      </p>
    
    </form>
  );
}
