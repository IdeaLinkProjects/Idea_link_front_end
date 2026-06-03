import { RefreshCw, Wallet } from "lucide-react";
import Link from "next/link";

type WalletBalanceCardProps = {
  balance: number;
  currency: string;
  loading: boolean;
  onRefresh: () => void;
  verifiedBank: boolean;
  quickWithdrawHref: string;
};

export function WalletBalanceCard({
  balance,
  currency,
  loading,
  onRefresh,
  verifiedBank,
  quickWithdrawHref,
}: WalletBalanceCardProps) {
  return (
    <article className="rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 p-6 text-white shadow-xl shadow-primary-950/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-primary-100/90">Current Balance</p>
          {loading ? <div className="mt-2 h-10 w-52 animate-pulse rounded-lg bg-white/20" /> : <p className="mt-2 text-4xl font-bold tracking-tight">{balance.toLocaleString()}</p>}
          <span className="mt-3 inline-flex rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
            {currency}
          </span>
        </div>
        <span className="rounded-2xl bg-white/10 p-3">
          <Wallet className="h-6 w-6" />
        </span>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href={quickWithdrawHref} className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-primary-900 transition hover:bg-primary-50">
          Quick Withdraw
        </Link>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-sm font-semibold transition hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
        <span className="text-xs text-primary-100/80">{verifiedBank ? "Verified bank account connected" : "Bank account verification pending"}</span>
      </div>
    </article>
  );
}
