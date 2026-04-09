import { Lock, Mail } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { emailOk } from "@/lib/register/email";
import type { RegisterFormState } from "@/lib/register/types";
import type { RegisterFormErrors, RegisterPageMessages } from "@/lib/register/validateRegisterForm";
import { RegisterIconField } from "./RegisterIconField";
import { RegisterPlainField } from "./RegisterPlainField";

type BasicInfoFieldsProps = {
  t: RegisterPageMessages;
  form: RegisterFormState;
  setForm: Dispatch<SetStateAction<RegisterFormState>>;
  errors: RegisterFormErrors;
  submitted: boolean;
  isDark: boolean;
};

export function BasicInfoFields({ t, form, setForm, errors, submitted, isDark }: BasicInfoFieldsProps) {
  return (
    <>
      <RegisterIconField
        id="reg-email"
        label={t.email}
        type="email"
        autoComplete="email"
        placeholder={t.emailPlaceholder}
        value={form.email}
        onValueChange={(email) => setForm((prev) => ({ ...prev, email }))}
        errorKey="email"
        errors={errors}
        submitted={submitted}
        validWhenSubmitted={emailOk(form.email)}
        isDark={isDark}
        Icon={Mail}
      />
      <RegisterIconField
        id="reg-password"
        label={t.password}
        type="password"
        autoComplete="new-password"
        placeholder={t.passwordPlaceholder}
        value={form.password}
        onValueChange={(password) => setForm((prev) => ({ ...prev, password }))}
        errorKey="password"
        errors={errors}
        submitted={submitted}
        validWhenSubmitted={form.password.length >= 8}
        isDark={isDark}
        Icon={Lock}
      />
      <RegisterPlainField
        id="reg-name"
        label={t.fullName}
        type="text"
        autoComplete="name"
        placeholder={t.fullNamePlaceholder}
        value={form.fullName}
        onValueChange={(fullName) => setForm((prev) => ({ ...prev, fullName }))}
        errorKey="fullName"
        errors={errors}
        submitted={submitted}
        validWhenSubmitted={form.fullName.trim().length > 0}
        isDark={isDark}
      />
      <RegisterPlainField
        id="reg-nid"
        label={t.nationalId}
        type="text"
        autoComplete="off"
        placeholder={t.nationalIdPlaceholder}
        value={form.nationalId}
        onValueChange={(nationalId) => setForm((prev) => ({ ...prev, nationalId }))}
        errorKey="nationalId"
        errors={errors}
        submitted={submitted}
        validWhenSubmitted={form.nationalId.trim().length > 0}
        isDark={isDark}
      />
    </>
  );
}
