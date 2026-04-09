import type { RegisterPageMessages } from "@/lib/register/validateRegisterForm";

type TermsCheckboxProps = {
  t: RegisterPageMessages;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error: string | undefined;
  submitted: boolean;
  isDark: boolean;
};

export function TermsCheckbox({ t, checked, onCheckedChange, error, submitted, isDark }: TermsCheckboxProps) {
  return (
    <>
      <label
        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${isDark ? "border-white/15 bg-white/5" : "border-zinc-200 bg-zinc-50/80"}`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-zinc-500 bg-transparent text-emerald-600 focus:ring-emerald-600"
        />
        <span className={`text-sm ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{t.terms}</span>
      </label>
      {submitted && error ? <p className="text-sm text-red-400">{error}</p> : null}
    </>
  );
}
