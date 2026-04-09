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
}: RegisterPlainFieldProps) {
  const err = errors[errorKey];
  return (
    <div>
      <label htmlFor={id} className={`mb-1 block text-sm font-medium ${registerLabelClass()}`}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className={registerPlainInputClass(submitted, err, validWhenSubmitted)}
      />
      {err ? <p className="mt-0.5 text-xs leading-tight text-red-400">{err}</p> : null}
    </div>
  );
}
