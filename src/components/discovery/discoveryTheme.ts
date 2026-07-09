export type DiscoveryTheme = {
  panel: string;
  panelCompact: string;
  label: string;
  input: string;
  muted: string;
  linkPrimary: string;
  checkClass: string;
  viewTabClass: (active: boolean) => string;
  viewTabList: string;
};

export function getDiscoveryTheme(isDark: boolean): DiscoveryTheme {
  return {
    panel: isDark
      ? "rounded-3xl border border-white/12 bg-zinc-900/40 p-5 shadow-xl shadow-black/20 ring-1 ring-white/[0.06] backdrop-blur-md sm:p-6"
      : "rounded-3xl border border-zinc-200/90 bg-white/90 p-5 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-primary-900/[0.04] backdrop-blur-sm sm:p-6",
    panelCompact: isDark
      ? "rounded-3xl border border-white/12 bg-zinc-900/35 px-4 py-3 shadow-md ring-1 ring-white/[0.05] backdrop-blur-md sm:px-5 sm:py-4"
      : "rounded-3xl border border-zinc-200/90 bg-white/95 px-4 py-3 shadow-md ring-1 ring-primary-900/[0.03] backdrop-blur-sm sm:px-5 sm:py-4",
    label: "text-[11px] font-bold uppercase tracking-wider text-zinc-500",
    input:
      "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/25 " +
      (isDark
        ? "border-white/15 bg-zinc-950/50 text-zinc-100 placeholder:text-zinc-500"
        : "border-zinc-200 bg-zinc-50/80 text-zinc-900 placeholder:text-zinc-400"),
    muted: isDark ? "text-zinc-400" : "text-zinc-600",
    linkPrimary: isDark ? "text-primary-300 hover:text-primary-200" : "text-primary-700 hover:text-primary-800",
    checkClass: "accent-primary-600 h-4 w-4 shrink-0 rounded border-zinc-400 text-primary-600 focus:ring-primary-500/40",
    viewTabList: isDark
      ? "rounded-2xl bg-zinc-900/50 ring-1 ring-white/[0.06]"
      : "rounded-2xl bg-zinc-100/90 ring-1 ring-zinc-200/80",
    viewTabClass: (active: boolean) =>
      `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 ${
        active
          ? isDark
            ? "bg-white text-zinc-900 shadow-md shadow-black/25"
            : "bg-zinc-900 text-white shadow-md shadow-zinc-900/15"
          : isDark
            ? "text-zinc-300 hover:bg-white/[0.08] hover:text-white"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`,
  };
}
