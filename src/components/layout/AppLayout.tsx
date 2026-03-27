import Link from "next/link";
import type { ReactNode } from "react";
import { primaryNavigation } from "@/constants/navigation";
import { siteConfig } from "@/config/site";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-base font-semibold">
            {siteConfig.name}
          </Link>
          <nav className="flex items-center gap-5 text-sm text-zinc-600">
            {primaryNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-zinc-900">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
