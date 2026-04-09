import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useState } from "react";
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
  Icon: LucideIcon;
  /** When true, shows eye toggle to show/hide password (use with type="password"). */
  passwordToggle?: boolean;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
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
  Icon,
  passwordToggle = false,
  showPasswordLabel = "Show password",
  hidePasswordLabel = "Hide password",
}: RegisterIconFieldProps) {
  const err = errors[errorKey];
  const [visible, setVisible] = useState(false);
  const inputType = passwordToggle ? (visible ? "text" : "password") : type;

  const toggleBtnClass =
    "absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 outline-none transition hover:bg-zinc-100 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:text-zinc-500 dark:hover:bg-white/10 dark:hover:text-zinc-200";

  return (
    <div>
      <label htmlFor={id} className={`mb-1 block text-sm font-medium ${registerLabelClass()}`}>
        {label}
      </label>
      <div className="relative">
        <Icon
          className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${registerIconMutedClass()}`}
          aria-hidden
        />
        <input
          id={id}
          type={inputType}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          className={registerIconInputClass(submitted, err, validWhenSubmitted, {
            trailingToggle: passwordToggle,
          })}
        />
        {passwordToggle ? (
          <button
            type="button"
            className={toggleBtnClass}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? hidePasswordLabel : showPasswordLabel}
            aria-pressed={visible}
            tabIndex={0}
          >
            {visible ? <EyeOff className="h-5 w-5" strokeWidth={2} aria-hidden /> : <Eye className="h-5 w-5" strokeWidth={2} aria-hidden />}
          </button>
        ) : null}
      </div>
      {err ? <p className="mt-0.5 text-xs leading-tight text-red-400">{err}</p> : null}
    </div>
  );
}
