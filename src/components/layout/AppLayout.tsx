import Link from "next/link";
import type { ReactNode } from "react";
import { IdealLinkLogo } from "@/components/brand/IdealLinkLogo";
import { primaryNavigation } from "@/constants/navigation";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 dark:bg-gradient-to-br dark:from-zinc-950 dark:via-emerald-950/25 dark:to-zinc-900 dark:text-zinc-100">
      <header className="border-b border-slate-200/90 bg-white/85 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-none">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <IdealLinkLogo className="inline-flex items-center transition hover:opacity-90" width={124} height={36} imageClassName="h-8 w-auto" />
          {primaryNavigation.length > 0 ? (
            <nav className="flex items-center gap-5 text-sm text-slate-600 dark:text-zinc-400">
              {primaryNavigation.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-slate-950 dark:hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
