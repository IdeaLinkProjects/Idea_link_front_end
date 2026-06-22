import clsx from "clsx";
import { LandingSection } from "../LandingSection";
import type { LandingCopy, LandingTheme } from "../types";

type LandingHowItWorksSectionProps = {
  t: LandingCopy;
  theme: LandingTheme;
};

export function LandingHowItWorksSection({ t, theme }: LandingHowItWorksSectionProps) {
  const { isDark, muted } = theme;

  return (
    <LandingSection theme={theme} id="how-it-works" className="py-16">
      <div className="mx-auto max-w-screen-2xl text-center">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.howItWorksTitle}</h2>
        <ol className="relative mt-14 grid gap-10 text-left md:grid-cols-3 md:gap-8">
          <div
            className={clsx(
              "pointer-events-none absolute top-5 right-[16%] left-[16%] hidden h-px md:block",
              isDark ? "bg-primary-800" : "bg-primary-200",
            )}
            aria-hidden
          />
          {t.howItWorksSteps.map((step) => (
            <li key={step.title} className="relative flex flex-col items-center text-center">
              <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-800 text-sm font-bold text-white shadow-md shadow-primary-900/20">
                {step.step}
              </span>
              <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
              <p className={clsx("mt-2 max-w-xs text-sm leading-relaxed", muted)}>{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </LandingSection>
  );
}
