export function getInvestThemeClasses(isDark: boolean) {
  return {
    card: isDark ? "border-white/15 bg-white/10" : "border-zinc-200 bg-white",
    muted: isDark ? "text-zinc-400" : "text-zinc-600",
    emphasis: isDark ? "text-zinc-100" : "text-zinc-900",
    panel: isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50",
    input: isDark ? "border-white/15 bg-zinc-900 text-white" : "border-zinc-300 bg-white text-zinc-900",
    outlineBtn: isDark ? "border-white/20 hover:bg-white/10" : "border-zinc-300 hover:bg-zinc-100",
  };
}
