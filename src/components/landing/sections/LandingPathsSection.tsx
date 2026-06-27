import clsx from "clsx";
import { Check } from "lucide-react";
import Link from "next/link";
import { LandingSection } from "../LandingSection";
import type { LandingCopy, LandingTheme } from "../types";

type LandingPathsSectionProps = {
  t: LandingCopy;
  theme: LandingTheme;
};

export function LandingPathsSection({ t, theme }: LandingPathsSectionProps) {
  const { isDark, muted } = theme;

  return (
    <LandingSection theme={theme} className="py-16">
      <div className="mx-auto grid max-w-screen-2xl gap-6 lg:grid-cols-2">
        <div
          className={clsx(
            "relative overflow-hidden rounded-3xl p-8 sm:p-10",
            "bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white shadow-xl shadow-primary-950/25",
          )}
        >
          <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10" aria-hidden />
          <p className="text-sm font-semibold text-primary-100">{t.pathInvestorEyebrow}</p>
          <ul className="mt-6 space-y-4">
            {t.pathInvestorBenefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-sm leading-relaxed text-white/90 sm:text-base">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Check className="h-3 w-3" aria-hidden />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-primary-900 transition hover:bg-primary-50"
          >
            {t.pathInvestorCta}
          </Link>
        </div>

        <div
          className={clsx(
            "relative overflow-hidden rounded-3xl p-8 sm:p-10",
            isDark ? "bg-zinc-900/60 text-zinc-100" : "bg-zinc-100 text-zinc-900",
          )}
        >
          <div
            className={clsx(
              "pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full",
              isDark ? "bg-primary-800/30" : "bg-primary-200/60",
            )}
            aria-hidden
          />
          <p className={clsx("text-sm font-semibold", isDark ? "text-primary-300" : "text-primary-800")}>
            {t.pathInnovatorEyebrow}
          </p>
          <ul className="mt-6 space-y-4">
            {t.pathInnovatorBenefits.map((benefit) => (
              <li key={benefit} className={clsx("flex gap-3 text-sm leading-relaxed sm:text-base", muted)}>
                <span
                  className={clsx(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    isDark ? "bg-primary-900/50 text-primary-300" : "bg-primary-200 text-primary-900",
                  )}
                >
                  <Check className="h-3 w-3" aria-hidden />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="mt-8 inline-flex rounded-full bg-primary-800 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            {t.pathInnovatorCta}
          </Link>
        </div>
      </div>
    </LandingSection>
  );
}
