import { useMemo } from "react";

export function useFintechTheme(isDark: boolean) {
  return useMemo(
    () => ({
      page: isDark ? "text-zinc-100" : "text-zinc-900",
      card: isDark
        ? "rounded-xl border border-zinc-800/90 bg-zinc-900/95 shadow-lg shadow-black/40"
        : "rounded-xl border border-zinc-200 bg-white shadow-md shadow-zinc-200/40",
      cardHighlight: isDark
        ? "border-primary-500/55 ring-1 ring-primary-500/25 shadow-[0_0_24px_rgba(16,185,129,0.12)]"
        : "border-primary-400/50 ring-1 ring-primary-400/20 shadow-[0_0_20px_rgba(16,185,129,0.08)]",
      label: "text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500",
      muted: isDark ? "text-zinc-500" : "text-zinc-500",
      value: isDark ? "text-white" : "text-zinc-900",
      accent: isDark ? "text-primary-300" : "text-primary-800",
      accentBg: isDark ? "bg-primary-500/15 text-primary-300" : "bg-primary-50 text-primary-800",
      divider: isDark ? "border-zinc-800" : "border-zinc-200",
      rowHover: isDark ? "hover:bg-zinc-800/50" : "hover:bg-zinc-50",
      alertDanger: isDark
        ? "border-red-900/60 bg-red-950/40 text-red-200"
        : "border-red-200 bg-red-50 text-red-800",
      alertInfo: isDark
        ? "border-primary-900/50 bg-primary-950/30 text-primary-100/90"
        : "border-primary-200 bg-primary-50/80 text-primary-900",
      btnPrimary:
        "inline-flex items-center justify-center gap-2 rounded-lg bg-primary-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-950/30 transition hover:bg-primary-900",
      btnGhost: isDark
        ? "inline-flex items-center gap-2 rounded-lg border border-primary-700/50 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-primary-600 hover:bg-primary-950/40"
        : "inline-flex items-center gap-2 rounded-lg border border-primary-300 bg-white px-4 py-2 text-sm font-semibold text-primary-900 transition hover:bg-primary-50",
      chartGrid: isDark ? "stroke-zinc-800" : "stroke-zinc-200",
      toggleActive: isDark
        ? "bg-primary-500/20 text-primary-300 ring-1 ring-primary-500/40"
        : "bg-primary-100 text-primary-900 ring-1 ring-primary-300",
      toggleIdle: isDark
        ? "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700",
      link: isDark
        ? "text-xs font-bold uppercase tracking-wide text-primary-300 transition hover:text-primary-200"
        : "text-xs font-bold uppercase tracking-wide text-primary-800 transition hover:text-primary-950",
      progressBar: "h-full rounded-full bg-primary-600",
    }),
    [isDark],
  );
}

export type FintechTheme = ReturnType<typeof useFintechTheme>;
