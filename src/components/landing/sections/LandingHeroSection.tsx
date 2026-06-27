import clsx from "clsx";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { HERO_IMAGE } from "../constants";
import { LandingSection } from "../LandingSection";
import type { LandingCopy, LandingTheme } from "../types";

type LandingHeroSectionProps = {
  t: LandingCopy;
  theme: LandingTheme;
  query: string;
  onQueryChange: (value: string) => void;
  onSubmitSearch: (e: FormEvent) => void;
  onPopularTagClick: (tag: string) => void;
};

export function LandingHeroSection({
  t,
  theme,
  query,
  onQueryChange,
  onSubmitSearch,
  onPopularTagClick,
}: LandingHeroSectionProps) {
  const { isDark, muted } = theme;

  return (
    <LandingSection
      theme={theme}
      className={clsx("pb-12 pt-6 sm:pb-14 sm:pt-8", isDark ? "bg-zinc-950" : "bg-[#f7faf8]")}
    >
      <div className="mx-auto grid max-w-screen-2xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <span
            className={clsx(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
              isDark ? "border-primary-500/30 bg-primary-950/50 text-primary-200" : "border-primary-200 bg-white text-primary-800",
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary-600" aria-hidden />
            {t.heroBadge}
          </span>

          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            {t.heroTitle}
          </h1>
          <p className={clsx("mt-5 max-w-xl text-pretty text-base leading-relaxed sm:text-lg", muted)}>
            {t.heroSubtitle}
          </p>

          <form onSubmit={onSubmitSearch} className="mt-8 max-w-xl">
            <div
              className={clsx(
                "flex overflow-hidden rounded-xl border shadow-sm transition focus-within:ring-2 focus-within:ring-primary-500/30",
                isDark ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-white",
              )}
            >
              <span className={clsx("flex items-center pl-4", muted)} aria-hidden>
                <Search className="h-5 w-5" />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={clsx(
                  "min-w-0 flex-1 border-0 bg-transparent px-3 py-3.5 text-base outline-none",
                  isDark ? "text-white placeholder:text-zinc-500" : "text-zinc-900 placeholder:text-zinc-400",
                )}
                aria-label={t.searchPlaceholder}
              />
              <button
                type="submit"
                className="shrink-0 bg-primary-800 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-primary-700 sm:px-7"
              >
                {t.searchSubmit}
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className={clsx("text-sm font-medium", muted)}>{t.popularLabel}</span>
            {t.popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onPopularTagClick(tag)}
                className={clsx(
                  "rounded-full border px-3 py-1 text-sm font-medium transition hover:-translate-y-0.5",
                  isDark
                    ? "border-white/15 bg-white/5 text-zinc-200 hover:border-primary-500/40 hover:bg-primary-950/50"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-primary-300 hover:bg-primary-50",
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/discovery"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-800 px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary-900/20 transition hover:bg-primary-700 hover:-translate-y-0.5"
            >
              {t.heroCtaExplore}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/register"
              className={clsx(
                "inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5",
                isDark
                  ? "border-primary-500/40 text-primary-200 hover:bg-primary-950/40"
                  : "border-primary-800 text-primary-900 hover:bg-primary-50",
              )}
            >
              {t.heroCtaSignUp}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none lg:justify-self-end">
          <div
            className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-primary-200/40 blur-2xl dark:bg-primary-800/20"
            aria-hidden
          />
          <div className="relative rotate-2 transition hover:rotate-1">
            <div
              className={clsx(
                "overflow-hidden rounded-3xl shadow-2xl shadow-primary-900/15 ring-1",
                isDark ? "ring-white/10" : "ring-black/5",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- marketing hero photography */}
              <img src={HERO_IMAGE} alt="" className="aspect-[4/3] w-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
