import clsx from "clsx";
import { ArrowRight, GraduationCap, Heart, Leaf, Store, Wallet, Zap } from "lucide-react";
import { LandingSection } from "../LandingSection";
import type { LandingCopy, LandingTheme } from "../types";

const SECTOR_ICONS = [Leaf, Wallet, Heart, GraduationCap, Zap, Store] as const;

type LandingSectorsSectionProps = {
  t: LandingCopy;
  theme: LandingTheme;
  onSectorClick: (keyword: string) => void;
};

export function LandingSectorsSection({ t, theme, onSectorClick }: LandingSectorsSectionProps) {
  const { isDark, card, mintSection } = theme;

  return (
    <LandingSection theme={theme} className={clsx("py-16", mintSection)}>
      <div className="mx-auto max-w-screen-2xl">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.sectorsTitle}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.sectors.map((sector, i) => {
            const Icon = SECTOR_ICONS[i] ?? Leaf;
            return (
              <button
                key={sector.name}
                type="button"
                onClick={() => onSectorClick(sector.keyword)}
                className={clsx(card, "group flex flex-col items-start p-6 text-left transition hover:-translate-y-0.5")}
              >
                <span
                  className={clsx(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl",
                    isDark ? "bg-primary-900/50 text-primary-300" : "bg-primary-100 text-primary-800",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-bold">{sector.name}</h3>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-700 transition group-hover:gap-2 dark:text-primary-400">
                  {t.sectorsBrowse}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </LandingSection>
  );
}
