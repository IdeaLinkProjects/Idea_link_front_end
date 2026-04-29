import type { ReactNode } from "react";

type DashboardPageHeaderProps = {
  title: string;
  subtitle: string;
  actions?: ReactNode;
};

export function DashboardPageHeader({ title, subtitle, actions }: DashboardPageHeaderProps) {
  return (
    <div className="rounded-3xl border border-slate-300 bg-gradient-to-br from-white via-slate-50 to-primary-50/35 px-6 py-7 shadow-sm shadow-slate-200/60 dark:border-white/15 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 dark:shadow-none sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-zinc-600 sm:text-base dark:text-zinc-400">{subtitle}</p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}
