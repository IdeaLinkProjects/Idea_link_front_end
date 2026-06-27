import clsx from "clsx";
import { ListChecks, Lock, ShieldCheck, Wallet } from "lucide-react";
import { LandingSection } from "../LandingSection";
import type { LandingCopy, LandingTheme } from "../types";

const TRANSPARENCY_ICONS = [ShieldCheck, ListChecks, Lock, Wallet] as const;

type LandingTransparencySectionProps = {
  t: LandingCopy;
  theme: LandingTheme;
};

export function LandingTransparencySection({ t, theme }: LandingTransparencySectionProps) {
  const { isDark, card, muted, mintSection } = theme;

  return (
    <LandingSection theme={theme} className={clsx("py-16", mintSection)}>
      <div className="mx-auto max-w-screen-2xl text-center">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.transparencyTitle}</h2>
        <p className={clsx("mx-auto mt-3 max-w-2xl text-sm leading-relaxed sm:text-base", muted)}>
          {t.transparencySubtitle}
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.transparencyFeatures.map((feature, i) => {
            const Icon = TRANSPARENCY_ICONS[i] ?? ShieldCheck;
            return (
              <div key={feature.title} className={clsx(card, "p-6 text-left")}>
                <span
                  className={clsx(
                    "inline-flex h-11 w-11 items-center justify-center rounded-full",
                    isDark ? "bg-primary-900/50 text-primary-300" : "bg-primary-100 text-primary-800",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-bold">{feature.title}</h3>
                <p className={clsx("mt-2 text-sm leading-relaxed", muted)}>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </LandingSection>
  );
}
