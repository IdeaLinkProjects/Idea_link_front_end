import clsx from "clsx";
import { useMemo, type Dispatch, type SetStateAction } from "react";
import { registerLabelClass } from "./fieldClasses";
import type { RegisterFormState } from "@/lib/register/types";
import type { RegisterFormErrors, RegisterPageMessages } from "@/lib/register/validateRegisterForm";

type InnovatorFieldsProps = {
  t: RegisterPageMessages;
  form: RegisterFormState;
  setForm: Dispatch<SetStateAction<RegisterFormState>>;
  errors: RegisterFormErrors;
  submitted: boolean;
  isDark: boolean;
};

export function InnovatorFields({ t, form, setForm, errors, submitted, isDark }: InnovatorFieldsProps) {
  const licenseErr = errors.license;
  const fileClass = useMemo(
    () =>
      clsx(
        "block w-full cursor-pointer rounded-xl border border-dashed px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white",
        isDark
          ? "border-white/25 bg-zinc-950/40 text-zinc-300 file:hover:bg-emerald-600 hover:bg-white/5"
          : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100",
        submitted && licenseErr && "border-red-500 ring-2 ring-red-500/20",
      ),
    [isDark, submitted, licenseErr],
  );

  return (
    <div>
      <label htmlFor="reg-license" className={`mb-1.5 block text-sm font-medium ${registerLabelClass(isDark)}`}>
        {t.businessLicense}
      </label>
      <input
        id="reg-license"
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={(e) => setForm((prev) => ({ ...prev, licenseFile: e.target.files?.[0] ?? null }))}
        className={fileClass}
      />
      <p className={`mt-1 text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.uploadHint}</p>
      {form.licenseFile ? (
        <p className={`mt-1 text-xs font-medium ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>{form.licenseFile.name}</p>
      ) : null}
      {submitted && licenseErr ? <p className="mt-1.5 text-sm text-red-400">{licenseErr}</p> : null}
    </div>
  );
}
