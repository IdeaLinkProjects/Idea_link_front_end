import Link from "next/link";
import { formatEtb } from "@/lib/format/formatEtb";
import type { DiscoveryIdeaView, PublicProjectBundle } from "@/lib/campaign/fromMyCampaign";
import type { Locale, messages } from "@/locales";

type ProjectDetailCopy = (typeof messages.en)["projectDetail"];

type ProjectFundingStickyProps = {
  isDark: boolean;
  locale: Locale;
  p: ProjectDetailCopy;
  idea: DiscoveryIdeaView;
  bundle: PublicProjectBundle;
  pct: number;
  investHref: string;
};

export function ProjectFundingSticky({ isDark, locale, p, idea, bundle, pct, investHref }: ProjectFundingStickyProps) {
  return (
    <div
      className={`sticky top-14 z-40 border-b backdrop-blur-xl ${isDark ? "border-white/10 bg-zinc-950/80" : "border-zinc-200/80 bg-zinc-50/90"}`}
    >
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-5">
        <div
          className={`relative overflow-hidden rounded-2xl border p-4 shadow-xl sm:p-6 ${
            isDark
              ? "border-primary-500/25 bg-gradient-to-br from-zinc-900 via-zinc-950 to-primary-950/50 ring-1 ring-white/10"
              : "border-primary-200/80 bg-gradient-to-br from-white via-primary-50/40 to-emerald-50/50 ring-1 ring-primary-900/10 shadow-primary-900/10"
          }`}
        >
          <div
            className={`pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full blur-3xl ${isDark ? "bg-primary-500/20" : "bg-primary-400/30"}`}
            aria-hidden
          />
          <div
            className={`pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full blur-3xl ${isDark ? "bg-emerald-600/10" : "bg-emerald-300/25"}`}
            aria-hidden
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-primary-300/90" : "text-primary-800"}`}>
                    {p.fundedLine.replace("{pct}", String(pct))}
                  </p>
                  <p className={`mt-1 text-xl font-extrabold tabular-nums tracking-tight sm:text-2xl ${isDark ? "text-white" : "text-zinc-900"}`}>
                    {formatEtb(bundle.raisedEtb, locale)}
                    <span className={`text-base font-semibold sm:text-lg ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                      {" "}
                      / {formatEtb(bundle.goalEtb, locale)} ETB
                    </span>
                  </p>
                </div>
                <div
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    isDark ? "border-white/15 bg-white/5 text-zinc-200" : "border-zinc-200 bg-white/90 text-zinc-700 shadow-sm"
                  }`}
                >
                  {p.daysRemainingLine.replace("{n}", String(idea.daysRemaining))}
                </div>
              </div>

              <div>
                <div className={`h-3 overflow-hidden rounded-full ${isDark ? "bg-zinc-800" : "bg-zinc-200/90"}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-700 via-primary-500 to-emerald-400 shadow-sm shadow-primary-500/40"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
              <Link
                href={investHref}
                className="inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-gradient-to-r from-primary-950 to-primary-700 px-8 py-3 text-center text-sm font-bold text-white shadow-lg shadow-primary-950/35 transition hover:from-primary-900 hover:to-primary-600 hover:shadow-primary-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
              >
                {p.investCta}
              </Link>
              <p
                className={`max-w-[16rem] text-center text-xs font-medium leading-snug sm:text-left lg:text-center xl:text-left ${
                  isDark ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                {p.minInvestment.replace("{amount}", formatEtb(bundle.minInvestmentEtb, locale))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
