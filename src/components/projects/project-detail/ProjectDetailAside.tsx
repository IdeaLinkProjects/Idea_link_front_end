import Link from "next/link";
import type { DiscoveryIdeaView, PublicProjectBundle } from "@/lib/campaign/fromMyCampaign";
import type { messages } from "@/locales";
import { projectDetailCardClass, projectDetailMutedClass } from "./projectDetailClassNames";

type ProjectDetailCopy = (typeof messages.en)["projectDetail"];

type ProjectDetailAsideProps = {
  isDark: boolean;
  p: ProjectDetailCopy;
  bundle: PublicProjectBundle;
  similarIdeas: DiscoveryIdeaView[];
  calcAmount: number;
  onCalcAmountChange: (n: number) => void;
  equityPreview: number;
};

export function ProjectDetailAside({
  isDark,
  p,
  bundle,
  similarIdeas,
  calcAmount,
  onCalcAmountChange,
  equityPreview,
}: ProjectDetailAsideProps) {
  const card = projectDetailCardClass(isDark);
  const muted = projectDetailMutedClass(isDark);

  return (
    <aside className="mt-10 space-y-6 lg:sticky lg:top-28 lg:mt-0 lg:self-start">
      <div
        className={`rounded-2xl border p-5 shadow-xl sm:p-6 ${
          isDark
            ? "border-primary-500/25 bg-gradient-to-b from-zinc-900 to-zinc-950 ring-1 ring-white/10"
            : "border-primary-200/70 bg-gradient-to-b from-white to-primary-50/30 ring-1 ring-primary-900/10"
        }`}
      >
        <h2 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-primary-300" : "text-primary-800"}`}>{p.calculatorTitle}</h2>
        <label htmlFor="calc-amt" className={`mt-4 block text-sm font-semibold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
          {p.calculatorAmountLabel}
        </label>
        <input
          id="calc-amt"
          type="number"
          min={0}
          step={500}
          value={calcAmount}
          onChange={(e) => onCalcAmountChange(Number(e.target.value) || 0)}
          className={`mt-2 w-full rounded-xl border-2 px-4 py-3 text-base font-semibold tabular-nums outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 ${
            isDark ? "border-white/15 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-900"
          }`}
        />
        <p className={`mt-2 text-xs leading-snug ${muted}`}>{p.calculatorHint}</p>
        <div
          className={`mt-5 rounded-xl border px-4 py-4 text-center ${
            isDark ? "border-white/10 bg-black/30" : "border-primary-200/60 bg-primary-50/50"
          }`}
        >
          <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>{p.calculatorEquityLabel}</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-primary-500 sm:text-4xl">{equityPreview.toFixed(2)}%</p>
        </div>
      </div>

      <div className={`rounded-2xl p-5 sm:p-6 ${card}`}>
        <h2 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-primary-300" : "text-primary-800"}`}>{p.quickStatsTitle}</h2>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {(
            [
              [p.statInvestors, bundle.investorsCount],
              [p.statUpdates, bundle.updatesCount],
              [p.statDocuments, bundle.documentsCount],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className={`rounded-xl border px-2 py-3 text-center ${
                isDark ? "border-white/10 bg-white/[0.04]" : "border-zinc-200/80 bg-zinc-50/80"
              }`}
            >
              <p className={`text-[10px] font-bold uppercase leading-tight tracking-wide sm:text-[11px] ${muted}`}>{label}</p>
              <p className={`mt-1 text-lg font-extrabold tabular-nums sm:text-xl ${isDark ? "text-white" : "text-zinc-900"}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {similarIdeas.length > 0 ? (
        <div className={`rounded-2xl p-5 sm:p-6 ${card}`}>
          <h2 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-primary-300" : "text-primary-800"}`}>{p.similarTitle}</h2>
          <ul className="mt-4 space-y-3">
            {similarIdeas.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/projects/${s.id}`}
                  className={`group block rounded-xl border px-3 py-3 transition ${
                    isDark
                      ? "border-transparent hover:border-white/15 hover:bg-white/[0.06]"
                      : "border-transparent hover:border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <p className={`font-semibold transition group-hover:text-primary-500 ${isDark ? "text-white" : "text-zinc-900"}`}>{s.name}</p>
                  <p className={`mt-1 text-xs font-medium ${muted}`}>
                    {s.fundedPercent}% funded · {s.categoryIcon}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
