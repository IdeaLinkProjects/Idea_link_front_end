import clsx from "clsx";
import Link from "next/link";
import { LandingSection } from "../LandingSection";
import type { LandingCopy, LandingTheme } from "../types";

type LandingFinalCtaSectionProps = {
  t: LandingCopy;
  theme: LandingTheme;
};

export function LandingFinalCtaSection({ t, theme }: LandingFinalCtaSectionProps) {
  return (
    <LandingSection theme={theme} className="pb-16">
      <div
        className={clsx(
          "relative mx-auto max-w-screen-2xl overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-10 sm:py-16",
          "bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white shadow-xl shadow-primary-950/30",
        )}
      >
        <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/5" aria-hidden />
        <div className="pointer-events-none absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-white/5" aria-hidden />
        <h2 className="relative text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">{t.finalCtaTitle}</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-sm text-white/85 sm:text-base">{t.finalCtaSubtitle}</p>
        <Link
          href="/register"
          className="relative mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-bold text-primary-900 transition hover:bg-primary-50"
        >
          {t.finalCtaButton}
        </Link>
      </div>
    </LandingSection>
  );
}
