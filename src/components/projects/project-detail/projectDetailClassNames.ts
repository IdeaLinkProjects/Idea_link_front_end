import type { ProjectDetailTabKey } from "./types";

/** Primary content cards (tab panels, lists). */
export function projectDetailCardClass(isDark: boolean): string {
  return isDark
    ? "border border-white/10 bg-zinc-900/70 shadow-lg shadow-black/30 ring-1 ring-white/[0.06]"
    : "border border-zinc-200/90 bg-white shadow-md shadow-zinc-900/[0.06] ring-1 ring-black/[0.04]";
}

/** Muted body / secondary text. */
export function projectDetailMutedClass(isDark: boolean): string {
  return isDark ? "text-zinc-400" : "text-zinc-600";
}

/** Section title inside cards (high visibility). */
export function projectDetailSectionTitleClass(isDark: boolean): string {
  return isDark
    ? "border-b border-white/10 pb-2 text-base font-bold tracking-tight text-white"
    : "border-b border-zinc-200 pb-2 text-base font-bold tracking-tight text-zinc-900";
}

/** Segmented tab control: idle pill. */
export function projectDetailTabClass(isDark: boolean, tab: ProjectDetailTabKey, active: ProjectDetailTabKey): string {
  const base = "relative rounded-xl px-4 py-2.5 text-sm font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50";
  if (tab === active) {
    return `${base} shadow-md ${
      isDark
        ? "bg-gradient-to-b from-zinc-800 to-zinc-900 text-white ring-1 ring-white/15"
        : "bg-white text-zinc-900 ring-1 ring-zinc-200/90 shadow-zinc-900/10"
    }`;
  }
  return `${base} ${isDark ? "text-zinc-400 hover:bg-white/5 hover:text-zinc-100" : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"}`;
}

/** Tab list strip background. */
export function projectDetailTabListClass(isDark: boolean): string {
  return isDark ? "rounded-2xl bg-zinc-900/80 p-1.5 ring-1 ring-white/10" : "rounded-2xl bg-zinc-200/60 p-1.5 ring-1 ring-zinc-300/50";
}
