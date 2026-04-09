import clsx from "clsx";

export function registerFieldBase(): string {
  return "bg-white text-zinc-900 placeholder:text-zinc-400 dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500";
}

function registerFieldBorder(
  submitted: boolean,
  error: string | undefined,
  showValidHighlight: boolean,
): string {
  const showError = Boolean(error);
  const showOk = submitted && showValidHighlight && !error;
  return clsx(
    !showError &&
      !showOk &&
      "border-zinc-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25 dark:border-white/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/30",
    showError && "border-red-500 ring-2 ring-red-500/20",
    showOk && "border-emerald-500 ring-1 ring-emerald-500/30",
  );
}

export function registerIconInputClass(
  submitted: boolean,
  error: string | undefined,
  showValidHighlight: boolean,
  options?: { trailingToggle?: boolean },
): string {
  return clsx(
    "w-full rounded-lg border py-2.5 pl-11 text-sm leading-snug outline-none transition",
    options?.trailingToggle ? "pr-11" : "pr-3.5",
    registerFieldBase(),
    registerFieldBorder(submitted, error, showValidHighlight),
  );
}

export function registerPlainInputClass(
  submitted: boolean,
  error: string | undefined,
  showValidHighlight: boolean,
): string {
  return clsx(
    "w-full rounded-lg border px-3.5 py-2.5 text-sm leading-snug outline-none transition",
    registerFieldBase(),
    registerFieldBorder(submitted, error, showValidHighlight),
  );
}

export function registerLabelClass(): string {
  return "text-zinc-700 dark:text-zinc-300";
}

export function registerIconMutedClass(): string {
  return "text-zinc-400 dark:text-zinc-500";
}
