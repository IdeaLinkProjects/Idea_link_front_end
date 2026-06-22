import clsx from "clsx";
import { ArrowRight, Quote } from "lucide-react";
import Link from "next/link";
import { LandingSection } from "../LandingSection";
import type { LandingCopy, LandingTheme } from "../types";
import { initialsFromName } from "../utils";

type LandingTestimonialSectionProps = {
  t: LandingCopy;
  theme: LandingTheme;
};

export function LandingTestimonialSection({ t, theme }: LandingTestimonialSectionProps) {
  const { isDark, card, muted } = theme;

  return (
    <LandingSection theme={theme} className="py-16">
      <div className={clsx(card, "mx-auto grid max-w-screen-2xl overflow-hidden lg:grid-cols-2")}>
        <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          <Quote className="h-10 w-10 text-primary-600 dark:text-primary-400" aria-hidden />
          <blockquote className="mt-6 text-xl font-bold leading-snug sm:text-2xl">
            &ldquo;{t.testimonialQuote}&rdquo;
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <div
              className={clsx(
                "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold",
                isDark ? "bg-primary-900/50 text-primary-200" : "bg-primary-100 text-primary-800",
              )}
            >
              {initialsFromName(t.testimonialAuthor)}
            </div>
            <div>
              <p className="font-bold">{t.testimonialAuthor}</p>
              <p className={clsx("text-sm", muted)}>{t.testimonialRole}</p>
            </div>
          </div>
          <Link
            href="/discovery"
            className="mt-6 inline-flex w-fit items-center gap-1 text-sm font-bold text-primary-700 transition hover:gap-2 dark:text-primary-400"
          >
            {t.testimonialCta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="relative min-h-[16rem] lg:min-h-full">
          {/* eslint-disable-next-line @next/next/no-img-element -- marketing testimonial photography */}
          <img src={t.testimonialImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
    </LandingSection>
  );
}
