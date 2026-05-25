import type { ReactNode } from "react";

type DashboardPageHeaderProps = {
  title: string;
  subtitle: string;
  actions?: ReactNode;
};

export function DashboardPageHeader({ title, subtitle, actions }: DashboardPageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-primary-50/40 px-6 py-7 shadow-lg shadow-slate-200/50 backdrop-blur-sm dark:border-white/10 dark:from-zinc-900/95 dark:via-zinc-900 dark:to-primary-950/30 dark:shadow-2xl dark:shadow-black/30 sm:px-8">
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primary-400/20 blur-3xl dark:bg-primary-500/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 left-1/3 h-28 w-28 rounded-full bg-emerald-400/15 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-primary-900 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl dark:from-white dark:via-zinc-100 dark:to-primary-200">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600 sm:text-base dark:text-zinc-400">{subtitle}</p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}
