import { LANDING_SECTION_X } from "./constants";
import type { LandingTheme } from "./types";

export function getLandingTheme(isDark: boolean): LandingTheme {
  return {
    isDark,
    section: isDark ? "text-zinc-100" : "text-zinc-900",
    muted: isDark ? "text-zinc-400" : "text-zinc-500",
    card: isDark
      ? "rounded-2xl border border-white/10 bg-zinc-900/60 shadow-lg shadow-black/20"
      : "rounded-2xl border border-zinc-200/80 bg-white shadow-md shadow-zinc-900/[0.05]",
    mintSection: isDark ? "bg-primary-950/25" : "bg-primary-50",
    sectionX: LANDING_SECTION_X,
  };
}
