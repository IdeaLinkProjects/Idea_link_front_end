import clsx from "clsx";
import Link from "next/link";
import { Lightbulb, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { RegisterPageMessages } from "@/lib/register/validateRegisterForm";

const FEATURE_ICONS = [Lightbulb, Users, ShieldCheck] as const;

type RegisterPromoPanelProps = {
  t: RegisterPageMessages;
  className?: string;
};

export function RegisterPromoPanel({ t, className }: RegisterPromoPanelProps) {
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  const features = [
    { title: t.heroFeature1Title, desc: t.heroFeature1Desc },
    { title: t.heroFeature2Title, desc: t.heroFeature2Desc },
    { title: t.heroFeature3Title, desc: t.heroFeature3Desc },
  ];

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!paused.current) {
        setActive((i) => (i + 1) % features.length);
      }
    }, 4200);
    return () => window.clearInterval(id);
  }, [features.length]);

  return (
    <aside
      className={clsx(
        "relative hidden min-h-0 flex-col justify-start overflow-hidden border-b border-zinc-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/80 px-6 py-6 dark:border-white/10 dark:from-emerald-950 dark:via-zinc-950 dark:to-zinc-950 lg:flex lg:h-full lg:min-h-0 lg:flex-1 lg:border-b-0 lg:border-r",
        className,
      )}
      aria-label="About IdealLink"
    >
      <div className="pointer-events-none absolute -left-16 top-1/4 h-56 w-56 animate-[pulse_5s_ease-in-out_infinite] rounded-full bg-emerald-400/35 blur-3xl dark:bg-emerald-500/30 lg:h-48 lg:w-48" />
      <div className="pointer-events-none absolute -right-12 bottom-1/4 h-48 w-48 animate-[pulse_6s_ease-in-out_infinite_1s] rounded-full bg-teal-300/40 blur-3xl dark:bg-teal-600/25 lg:h-40 lg:w-40" />
      <div className="pointer-events-none absolute left-1/3 top-0 h-28 w-[20rem] -translate-x-1/2 animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-emerald-200/50 blur-2xl dark:bg-emerald-400/15 lg:h-24" />

      <div className="relative z-10 min-h-0 w-full max-w-none lg:max-h-full lg:overflow-hidden">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/25 bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-800 shadow-sm backdrop-blur-sm transition hover:scale-[1.02] dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 sm:text-xs">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-400 sm:h-4 sm:w-4" aria-hidden />
          {t.heroBadge}
        </div>

        <h2 className="mt-3 text-balance text-[1.65rem] font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-3xl sm:leading-[1.15] lg:text-[2.15rem] lg:leading-tight dark:text-white">
          {t.heroTitle}
        </h2>
        <p className="mt-3 max-w-none text-pretty text-sm leading-relaxed text-zinc-600 sm:text-[15px] dark:text-zinc-400">{t.heroSubtitle}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {[t.heroStat1, t.heroStat2, t.heroStat3].map((label, i) => (
            <span
              key={label}
              className={clsx(
                "rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition duration-500 sm:text-xs",
                "border-zinc-200/80 bg-white/60 text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300",
                active === i &&
                  "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
              )}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {label}
            </span>
          ))}
        </div>

        <ul className="mt-4 space-y-3">
          {features.map((f, i) => {
            const Icon = FEATURE_ICONS[i] ?? Sparkles;
            const isActive = active === i;
            return (
              <li key={f.title}>
                <button
                  type="button"
                  className={clsx(
                    "group flex w-full gap-3 rounded-lg border p-3 text-left transition-all duration-300 sm:gap-3.5 sm:p-3.5",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
                    isActive
                      ? "scale-[1.01] border-emerald-400/60 bg-white shadow-lg shadow-emerald-900/10 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:shadow-lg dark:shadow-emerald-950/40"
                      : "border-zinc-200/90 bg-white/50 hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.06]",
                  )}
                  onMouseEnter={() => {
                    paused.current = true;
                    setActive(i);
                  }}
                  onMouseLeave={() => {
                    paused.current = false;
                  }}
                  onFocus={() => {
                    paused.current = true;
                    setActive(i);
                  }}
                  onBlur={() => {
                    paused.current = false;
                  }}
                >
                  <span
                    className={clsx(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition duration-300 sm:h-12 sm:w-12",
                      isActive
                        ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200"
                        : "border-zinc-200 bg-zinc-50 text-zinc-500 group-hover:border-emerald-200 group-hover:text-emerald-700 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-400 dark:group-hover:text-emerald-300",
                    )}
                  >
                    <Icon className={clsx("h-[1.125rem] w-[1.125rem] transition-transform duration-300 sm:h-5 sm:w-5", isActive && "scale-110")} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-tight text-zinc-900 sm:text-[15px] dark:text-zinc-100">{f.title}</span>
                    <span className="mt-1 block text-xs leading-snug text-zinc-600 sm:text-sm dark:text-zinc-400">{f.desc}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <Link
          href="/discovery"
          className="group mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-50/80 px-4 py-2 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/20 sm:py-2.5 sm:text-sm"
        >
          {t.heroExplore}
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1" aria-hidden>
            →
          </span>
        </Link>
      </div>
    </aside>
  );
}
