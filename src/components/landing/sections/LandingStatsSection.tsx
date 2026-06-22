import clsx from "clsx";
import { LandingSection } from "../LandingSection";
import type { LandingCopy, LandingTheme } from "../types";

type LandingStatsSectionProps = {
  t: LandingCopy;
  theme: LandingTheme;
  stats: LandingCopy["stats"];
};

export function LandingStatsSection({ t, theme, stats }: LandingStatsSectionProps) {
  const { muted, mintSection } = theme;

  return (
    <LandingSection theme={theme} className={clsx("py-10", mintSection)}>
      <div className="mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-extrabold tracking-tight text-primary-800 dark:text-primary-300 sm:text-5xl">
                {stat.value}
              </p>
              <p className={clsx("mt-1 text-sm font-medium", muted)}>{stat.label}</p>
            </div>
          ))}
        </div>
        <p className={clsx("mt-8 text-center text-xs", muted)}>{t.statsFootnote}</p>
      </div>
    </LandingSection>
  );
}
