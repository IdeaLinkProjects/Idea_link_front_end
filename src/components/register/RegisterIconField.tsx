import type { LucideIcon } from "lucide-react";
import type { RegisterFormErrors } from "@/lib/register/validateRegisterForm";
import { registerIconInputClass, registerIconMutedClass, registerLabelClass } from "./fieldClasses";

type RegisterIconFieldProps = {
  id: string;
  label: string;
  type: string;
  autoComplete?: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  errorKey: keyof RegisterFormErrors;
  errors: RegisterFormErrors;
  submitted: boolean;
  validWhenSubmitted: boolean;
  isDark: boolean;
  Icon: LucideIcon;
};

export function RegisterIconField({
  id,
  label,
  type,
  autoComplete,
  placeholder,
  value,
  onValueChange,
  errorKey,
  errors,
  submitted,
  validWhenSubmitted,
  isDark,
  Icon,
}: RegisterIconFieldProps) {
  const err = errors[errorKey];
  return (
    <div>
      <label htmlFor={id} className={`mb-1.5 block text-sm font-medium ${registerLabelClass(isDark)}`}>
        {label}
      </label>
      <div className="relative">
        <Icon
          className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${registerIconMutedClass(isDark)}`}
          aria-hidden
        />
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          className={registerIconInputClass(isDark, submitted, err, validWhenSubmitted)}
        />
      </div>
      {submitted && err ? <p className="mt-1.5 text-sm text-red-400">{err}</p> : null}
    </div>
  );
}
