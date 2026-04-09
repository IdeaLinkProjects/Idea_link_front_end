import Link from "next/link";
import type { FormEvent } from "react";
import type { Dispatch, SetStateAction } from "react";
import { REGISTER_ROLE, type RegisterRole } from "@/lib/register/constants";
import type { RegisterFormState } from "@/lib/register/types";
import type { RegisterFormErrors, RegisterPageMessages } from "@/lib/register/validateRegisterForm";
import { BasicInfoFields } from "./BasicInfoFields";
import { InnovatorFields } from "./InnovatorFields";
import { InvestorFields } from "./InvestorFields";
import { TermsCheckbox } from "./TermsCheckbox";

type RegisterFormProps = {
  t: RegisterPageMessages;
  isDark: boolean;
  role: RegisterRole;
  form: RegisterFormState;
  setForm: Dispatch<SetStateAction<RegisterFormState>>;
  errors: RegisterFormErrors;
  submitted: boolean;
  onSubmit: (ev: FormEvent<HTMLFormElement>) => void;
  onChangeRole: () => void;
};

export function RegisterForm({
  t,
  isDark,
  role,
  form,
  setForm,
  errors,
  submitted,
  onSubmit,
  onChangeRole,
}: RegisterFormProps) {
  const footerMuted = isDark ? "text-zinc-400" : "text-zinc-600";
  const footerLink = `font-semibold ${isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-700 hover:text-emerald-800"}`;

  return (
    <form
      onSubmit={onSubmit}
      className={`mt-8 space-y-5 rounded-2xl border p-6 sm:p-8 ${isDark ? "border-white/15 bg-white/10 shadow-lg shadow-black/30 backdrop-blur-md" : "border-zinc-200 bg-white shadow-xl shadow-zinc-300/50"}`}
      noValidate
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`text-sm font-semibold ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>
          {role === REGISTER_ROLE.INNOVATOR ? t.innovatorTitle : t.investorTitle}
        </p>
        <button
          type="button"
          onClick={onChangeRole}
          className={`text-sm font-medium underline-offset-2 ${isDark ? "text-zinc-400 hover:text-emerald-300" : "text-zinc-600 hover:text-emerald-700"} hover:underline`}
        >
          {t.changeRole}
        </button>
      </div>

      <BasicInfoFields t={t} form={form} setForm={setForm} errors={errors} submitted={submitted} isDark={isDark} />

      {role === REGISTER_ROLE.INNOVATOR ? (
        <InnovatorFields t={t} form={form} setForm={setForm} errors={errors} submitted={submitted} isDark={isDark} />
      ) : (
        <InvestorFields t={t} form={form} setForm={setForm} errors={errors} submitted={submitted} isDark={isDark} />
      )}

      <TermsCheckbox
        t={t}
        checked={form.terms}
        onCheckedChange={(terms) => setForm((prev) => ({ ...prev, terms }))}
        error={errors.terms}
        submitted={submitted}
        isDark={isDark}
      />

      <button
        type="submit"
        className="w-full rounded-xl bg-emerald-700 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-600"
      >
        {t.createAccount}
      </button>

      <p className={`text-center text-sm ${footerMuted}`}>
        {t.alreadyHave}{" "}
        <Link href="/login" className={footerLink}>
          {t.loginHere}
        </Link>
      </p>
    </form>
  );
}
