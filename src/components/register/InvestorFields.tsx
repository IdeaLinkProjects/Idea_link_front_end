import { useMemo, type Dispatch, type SetStateAction } from "react";
import { HORIZON, PRIOR_INVESTMENT, RISK_TOLERANCE } from "@/lib/register/constants";
import type { RegisterFormState } from "@/lib/register/types";
import type { RegisterFormErrors, RegisterPageMessages } from "@/lib/register/validateRegisterForm";
import { registerLabelClass } from "./fieldClasses";

function riskRadioLabelClass(isDark: boolean): string {
  return isDark
    ? "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm border-white/15 bg-zinc-950/40 text-zinc-200 has-[:checked]:border-emerald-500 has-[:checked]:ring-1 has-[:checked]:ring-emerald-500/40"
    : "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm border-zinc-200 bg-white text-zinc-800 has-[:checked]:border-emerald-600 has-[:checked]:ring-1 has-[:checked]:ring-emerald-600/30";
}

type InvestorFieldsProps = {
  t: RegisterPageMessages;
  form: RegisterFormState;
  setForm: Dispatch<SetStateAction<RegisterFormState>>;
  errors: RegisterFormErrors;
  submitted: boolean;
  isDark: boolean;
};

export function InvestorFields({ t, form, setForm, errors, submitted, isDark }: InvestorFieldsProps) {
  const horizonOptions = useMemo(
    () => [
      { value: HORIZON.SHORT, label: t.riskQ1o1 },
      { value: HORIZON.MEDIUM, label: t.riskQ1o2 },
      { value: HORIZON.LONG, label: t.riskQ1o3 },
    ],
    [t],
  );
  const toleranceOptions = useMemo(
    () => [
      { value: RISK_TOLERANCE.CONSERVATIVE, label: t.riskQ2o1 },
      { value: RISK_TOLERANCE.MODERATE, label: t.riskQ2o2 },
      { value: RISK_TOLERANCE.AGGRESSIVE, label: t.riskQ2o3 },
    ],
    [t],
  );
  const priorOptions = useMemo(
    () => [
      { value: PRIOR_INVESTMENT.YES, label: t.riskQ3o1 },
      { value: PRIOR_INVESTMENT.NO, label: t.riskQ3o2 },
    ],
    [t],
  );

  const riskErr = errors.risk;
  const radio = riskRadioLabelClass(isDark);

  return (
    <fieldset
      className={`space-y-4 rounded-xl border p-4 ${submitted && riskErr ? "border-red-500 bg-red-500/10" : isDark ? "border-white/15 bg-zinc-950/30" : "border-zinc-200 bg-zinc-50/80"}`}
    >
      <legend className={`px-1 text-sm font-semibold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{t.riskSectionTitle}</legend>

      <div>
        <p className={`mb-2 text-sm font-medium ${registerLabelClass(isDark)}`}>{t.riskQ1}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {horizonOptions.map((o) => (
            <label key={o.value} className={radio}>
              <input
                type="radio"
                name="horizon"
                value={o.value}
                checked={form.horizon === o.value}
                onChange={() => setForm((prev) => ({ ...prev, horizon: o.value }))}
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className={`mb-2 text-sm font-medium ${registerLabelClass(isDark)}`}>{t.riskQ2}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {toleranceOptions.map((o) => (
            <label key={o.value} className={radio}>
              <input
                type="radio"
                name="tolerance"
                value={o.value}
                checked={form.tolerance === o.value}
                onChange={() => setForm((prev) => ({ ...prev, tolerance: o.value }))}
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className={`mb-2 text-sm font-medium ${registerLabelClass(isDark)}`}>{t.riskQ3}</p>
        <div className="flex flex-wrap gap-2">
          {priorOptions.map((o) => (
            <label key={o.value} className={radio}>
              <input
                type="radio"
                name="prior"
                value={o.value}
                checked={form.priorInvest === o.value}
                onChange={() => setForm((prev) => ({ ...prev, priorInvest: o.value }))}
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>
      {submitted && riskErr ? <p className="text-sm text-red-400">{riskErr}</p> : null}
    </fieldset>
  );
}
