import clsx from "clsx";

export function registerFieldBase(isDark: boolean): string {
  return isDark
    ? "bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500"
    : "bg-white text-zinc-900 placeholder:text-zinc-400";
}

function registerFieldBorder(
  isDark: boolean,
  submitted: boolean,
  error: string | undefined,
  showValidHighlight: boolean,
): string {
  const showError = submitted && Boolean(error);
  const showOk = submitted && showValidHighlight && !error;
  return clsx(
    !showError &&
      !showOk &&
      (isDark
        ? "border-white/20 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
        : "border-zinc-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25"),
    showError && "border-red-500 ring-2 ring-red-500/20",
    showOk && "border-emerald-500 ring-1 ring-emerald-500/30",
  );
}

export function registerIconInputClass(
  isDark: boolean,
  submitted: boolean,
  error: string | undefined,
  showValidHighlight: boolean,
): string {
  return clsx(
    "w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition",
    registerFieldBase(isDark),
    registerFieldBorder(isDark, submitted, error, showValidHighlight),
  );
}

export function registerPlainInputClass(
  isDark: boolean,
  submitted: boolean,
  error: string | undefined,
  showValidHighlight: boolean,
): string {
  return clsx(
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition",
    registerFieldBase(isDark),
    registerFieldBorder(isDark, submitted, error, showValidHighlight),
  );
}

export function registerLabelClass(isDark: boolean): string {
  return isDark ? "text-zinc-300" : "text-zinc-700";
}

export function registerIconMutedClass(isDark: boolean): string {
  return isDark ? "text-zinc-500" : "text-zinc-400";
}
