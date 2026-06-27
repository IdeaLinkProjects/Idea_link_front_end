import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { LandingSection } from "../LandingSection";
import type { LandingCopy, LandingTheme } from "../types";

type LandingFaqSectionProps = {
  t: LandingCopy;
  theme: LandingTheme;
  openFaq: number | null;
  onToggleFaq: (index: number) => void;
};

export function LandingFaqSection({ t, theme, openFaq, onToggleFaq }: LandingFaqSectionProps) {
  const { isDark, muted, mintSection } = theme;

  return (
    <LandingSection theme={theme} className={clsx("py-16", mintSection)}>
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">{t.faqTitle}</h2>
        <ul className="mt-10 space-y-3">
          {t.faqItems.map((item, i) => {
            const open = openFaq === i;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => onToggleFaq(i)}
                  className={clsx(
                    "flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition sm:text-base",
                    isDark
                      ? "border-white/10 bg-zinc-900/60 hover:bg-zinc-900"
                      : "border-zinc-200/80 bg-white hover:bg-zinc-50",
                  )}
                  aria-expanded={open}
                >
                  {item.q}
                  <ChevronDown
                    className={clsx(
                      "h-5 w-5 shrink-0 text-primary-600 transition dark:text-primary-400",
                      open && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                {open ? <p className={clsx("px-5 pb-4 pt-2 text-sm leading-relaxed", muted)}>{item.a}</p> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </LandingSection>
  );
}
