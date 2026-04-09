import type { RegisterFormErrors } from "@/lib/register/validateRegisterForm";
import { registerLabelClass, registerPlainInputClass } from "./fieldClasses";

type RegisterPlainFieldProps = {
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
};

export function RegisterPlainField({
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
}: RegisterPlainFieldProps) {
  const err = errors[errorKey];
  return (
    <div>
      <label htmlFor={id} className={`mb-1.5 block text-sm font-medium ${registerLabelClass(isDark)}`}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className={registerPlainInputClass(isDark, submitted, err, validWhenSubmitted)}
      />
      {submitted && err ? <p className="mt-1.5 text-sm text-red-400">{err}</p> : null}
    </div>
  );
}
