import { buildInvestRiskBullets } from "./buildInvestRiskBullets";
import { getInvestThemeClasses } from "./investTheme";
import type { InvestViewProps } from "./types";

type InvestStepReviewProps = InvestViewProps & {
  numberOfShares: number;
  confirmDateLabel: string;
  notes: string;
  onNotesChange: (value: string) => void;
  chkDisclosed: boolean;
  onChkDisclosedChange: (checked: boolean) => void;
  step2Attempted: boolean;
  acknowledgementsValid: boolean;
  submitError: string;
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
};

function InvestAckCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-zinc-500 text-primary-600 focus:ring-primary-500"
      />
      <span>{label}</span>
    </label>
  );
}

export function InvestStepReview({
  isDark,
  locale,
  inv,
  bundle,
  numberOfShares,
  confirmDateLabel,
  notes,
  onNotesChange,
  chkDisclosed,
  onChkDisclosedChange,
  step2Attempted,
  acknowledgementsValid,
  submitError,
  isSubmitting,
  onConfirm,
  onBack,
}: InvestStepReviewProps) {
  const theme = getInvestThemeClasses(isDark);
  const riskBullets = buildInvestRiskBullets(bundle, locale);

  return (
    <div className={`rounded-2xl border p-6 sm:p-8 ${theme.card}`}>
      <h1 className="text-xl font-extrabold sm:text-2xl">{inv.step2Heading}</h1>

      <div className={`mt-6 rounded-xl border p-4 ${theme.panel}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-primary-500">{inv.summaryTitle}</p>
        <dl className={`mt-3 space-y-2 text-sm ${theme.muted}`}>
          <div className="flex justify-between">
            <dt>Number of shares</dt>
            <dd className={`font-semibold ${theme.emphasis}`}>{numberOfShares.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{inv.summaryDate}</dt>
            <dd>{confirmDateLabel}</dd>
          </div>
        </dl>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-bold text-primary-500">{inv.risksSectionTitle}</h2>
        <ul className={`mt-3 list-disc space-y-2 pl-5 text-sm ${theme.muted}`}>
          {riskBullets.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>

      <div className="mt-8 space-y-4">
        <InvestAckCheckbox checked={chkDisclosed} onChange={onChkDisclosedChange} label={inv.chkDisclosed} />
        {step2Attempted && !acknowledgementsValid ? <p className="text-sm font-medium text-red-400">{inv.chkError}</p> : null}
      </div>

      <div className="mt-6">
        <label htmlFor="inv-notes" className={`text-sm font-semibold ${theme.muted}`}>
          Investment note (optional)
        </label>
        <textarea
          id="inv-notes"
          rows={3}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add a short note for this investment"
          className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 ${theme.input}`}
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-primary-950 py-3.5 text-sm font-bold text-white hover:bg-primary-900"
        >
          {isSubmitting ? "Processing..." : inv.confirmInvestment}
        </button>
        <button
          type="button"
          onClick={onBack}
          className={`flex-1 rounded-xl border py-3.5 text-sm font-semibold ${theme.outlineBtn}`}
        >
          {inv.cancel}
        </button>
      </div>
      {submitError ? <p className="mt-3 text-sm font-medium text-red-400">{submitError}</p> : null}
    </div>
  );
}
