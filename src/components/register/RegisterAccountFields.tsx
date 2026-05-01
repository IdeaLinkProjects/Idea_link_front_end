import { Lock, LockKeyhole, Mail } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { emailOk } from "@/lib/register/email";
import type { RegisterFormState } from "@/lib/register/types";
import type { RegisterFormErrors, RegisterPageMessages } from "@/lib/register/validateRegisterForm";
import { RegisterIconField } from "./RegisterIconField";
import { RegisterPlainField } from "./RegisterPlainField";

type RegisterAccountFieldsProps = {
  t: RegisterPageMessages;
  form: RegisterFormState;
  setForm: Dispatch<SetStateAction<RegisterFormState>>;
  errors: RegisterFormErrors;
  submitted: boolean;
};

export function RegisterAccountFields({ t, form, setForm, errors, submitted }: RegisterAccountFieldsProps) {
  return (
    <>
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 [&>div]:min-w-0">
        <RegisterPlainField
          id="reg-first-name"
          label={t.firstName}
          type="text"
          autoComplete="given-name"
          placeholder={t.firstNamePlaceholder}
          value={form.firstName}
          onValueChange={(firstName) => setForm((prev) => ({ ...prev, firstName }))}
          errorKey="firstName"
          errors={errors}
          submitted={submitted}
          validWhenSubmitted={form.firstName.trim().length > 0}
        />
        <RegisterPlainField
          id="reg-last-name"
          label={t.lastName}
          type="text"
          autoComplete="family-name"
          placeholder={t.lastNamePlaceholder}
          value={form.lastName}
          onValueChange={(lastName) => setForm((prev) => ({ ...prev, lastName }))}
          errorKey="lastName"
          errors={errors}
          submitted={submitted}
          validWhenSubmitted={form.lastName.trim().length > 0}
        />
      </div>
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
        Icon={Lock}
        passwordToggle
        showPasswordLabel={t.showPassword}
        hidePasswordLabel={t.hidePassword}
      />
      <RegisterIconField
        id="reg-confirm-password"
        label={t.confirmPassword}
        type="password"
        autoComplete="new-password"
        placeholder={t.confirmPasswordPlaceholder}
        value={form.confirmPassword}
        onValueChange={(confirmPassword) => setForm((prev) => ({ ...prev, confirmPassword }))}
        errorKey="confirmPassword"
        errors={errors}
        submitted={submitted}
        validWhenSubmitted={form.confirmPassword.length > 0 && form.confirmPassword === form.password}
        Icon={LockKeyhole}
        passwordToggle
        showPasswordLabel={t.showPassword}
        hidePasswordLabel={t.hidePassword}
      />
    </>
  );
}
