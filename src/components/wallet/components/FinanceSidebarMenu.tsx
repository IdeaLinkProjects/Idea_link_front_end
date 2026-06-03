import Link from "next/link";
import { useRouter } from "next/router";
import { ReceiptText, Wallet } from "lucide-react";
import type { ComponentType } from "react";

export type FinanceNavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  match: (pathname: string) => boolean;
};

export function defaultFinanceNavItems(labels: {
  walletDashboard: string;
  transactionHistory: string;
}): FinanceNavItem[] {
  return [
    {
      href: "/dashboard/wallet",
      label: labels.walletDashboard,
      icon: Wallet,
      match: (p) => p === "/dashboard/wallet",
    },
    {
      href: "/dashboard/wallet/transactions",
      label: labels.transactionHistory,
      icon: ReceiptText,
      match: (p) => p.startsWith("/dashboard/wallet/transactions"),
    },
  ];
}

type FinanceSidebarMenuProps = {
  sectionLabel: string;
  items: FinanceNavItem[];
  isDark: boolean;
  navActive: string;
  navInactive: string;
  onNavigate: () => void;
};

export function FinanceSidebarMenu({
  sectionLabel,
  items,
  isDark,
  navActive,
  navInactive,
  onNavigate,
}: FinanceSidebarMenuProps) {
  const router = useRouter();

  return (
    <section className={`mt-3 rounded-2xl border p-2 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50/60"}`}>
      <p className={`px-2 pb-2 text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
        {sectionLabel}
      </p>
      <div className="space-y-1">
        {items.map((item) => {
          const active = item.match(router.pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 ${active ? navActive : navInactive}`}
            >
              <Icon className={`h-4 w-4 transition-transform duration-200 ${active ? "" : "group-hover:translate-x-0.5"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
