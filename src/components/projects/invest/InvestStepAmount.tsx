import { formatEtb } from "@/lib/format/formatEtb";
import { getInvestThemeClasses } from "./investTheme";
import type { InvestViewProps } from "./types";

type InvestStepAmountProps = InvestViewProps & {
  numberOfShares: number;
  onNumberOfSharesChange: (value: number) => void;
  step1ErrorShares: boolean;
  remaining: number;
  onReview: () => void;
};

export function InvestStepAmount({
  isDark,
  locale,
  inv,
  idea,
  bundle,
  pct,
  numberOfShares,
  onNumberOfSharesChange,
  step1ErrorShares,
  remaining,
  onReview,
}: InvestStepAmountProps) {
  const theme = getInvestThemeClasses(isDark);

  return (
    <div className={`rounded-2xl border p-6 sm:p-8 ${theme.card}`}>
      <h1 className="text-xl font-extrabold leading-tight sm:text-2xl">{inv.step1Heading.replace("{project}", idea.name)}</h1>

      <div className={`mt-6 space-y-2 rounded-xl border p-4 text-sm ${theme.panel}`}>
        <p className="font-semibold text-primary-500">{inv.fundedStatus.replace("{pct}", String(pct))}</p>
        <p className={`tabular-nums ${theme.muted}`}>
          {inv.raisedOfGoal
            .replace("{raised}", formatEtb(bundle.raisedEtb, locale))
            .replace("{goal}", formatEtb(bundle.goalEtb, locale))}
        </p>
        <p className="font-medium text-primary-400">
          {inv.availableRemaining.replace("{amount}", formatEtb(remaining, locale))}
        </p>
      </div>

      <div className="mt-6">
        <label htmlFor="inv-amount" className={`text-sm font-semibold ${theme.muted}`}>
          Number of shares
        </label>
        <input
          id="inv-amount"
          type="number"
          min={1}
          step={1}
          value={numberOfShares}
          onChange={(e) => onNumberOfSharesChange(Number(e.target.value) || 0)}
          className={`mt-2 w-full rounded-xl border px-4 py-3 text-lg font-semibold tabular-nums outline-none focus:ring-2 focus:ring-primary-500/50 ${theme.input}`}
          aria-invalid={step1ErrorShares}
        />
        <p className={`mt-2 text-sm font-medium ${theme.muted}`}>Enter whole shares only.</p>
        {step1ErrorShares ? <p className="mt-2 text-sm text-red-400">Please enter at least 1 share.</p> : null}
      </div>

      <button
        type="button"
        onClick={onReview}
        disabled={remaining < bundle.minInvestmentEtb}
        className="mt-8 w-full rounded-xl bg-primary-950 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-primary-950/30 transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {inv.reviewButton}
      </button>
    </div>
  );
}
