import Link from "next/link";
import { getInvestThemeClasses } from "./investTheme";
import type { InvestViewProps } from "./types";

type InvestSuccessProps = InvestViewProps & {
  numberOfShares: number;
  notes: string;
  reference: string;
};

export function InvestSuccess({ isDark, inv, idea, numberOfShares, notes, reference }: InvestSuccessProps) {
  const theme = getInvestThemeClasses(isDark);

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-6 text-center ${theme.card}`}>
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-950 text-2xl text-white">
          ✓
        </div>
        <h1 className="text-2xl font-extrabold text-primary-500">{inv.successTitle}</h1>
        <p className={`mt-2 text-sm ${theme.muted}`}>{inv.successBody}</p>
      </div>

      <div className={`rounded-2xl border p-6 ${theme.card}`}>
        <h2 className="text-sm font-bold uppercase tracking-wide text-primary-500">{inv.receiptTitle}</h2>
        <dl className={`mt-4 space-y-2 text-sm ${theme.muted}`}>
          <div className="flex justify-between gap-4">
            <dt>{inv.receiptProject}</dt>
            <dd className={`text-right font-medium ${theme.emphasis}`}>{idea.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Number of shares</dt>
            <dd className={`font-mono font-semibold ${isDark ? "text-primary-400" : "text-primary-700"}`}>
              {numberOfShares.toLocaleString()}
            </dd>
          </div>
          {notes.trim() ? (
            <div className="flex justify-between gap-4">
              <dt>Note</dt>
              <dd className={`text-right ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{notes}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt>{inv.receiptReference}</dt>
            <dd className="font-mono text-xs">{reference}</dd>
          </div>
        </dl>
      </div>

      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-primary-500">{inv.nextSteps}</p>
        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard/portfolio"
            className="rounded-xl bg-primary-950 py-3 text-center text-sm font-semibold text-white hover:bg-primary-900"
          >
            {inv.viewPortfolio}
          </Link>
          <Link
            href="/"
            className={`rounded-xl border py-3 text-center text-sm font-semibold ${theme.outlineBtn}`}
          >
            {inv.browseMore}
          </Link>
        </div>
      </div>
    </div>
  );
}
