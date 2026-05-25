import { ArrowUpRight, Wallet } from "lucide-react";
import type { Locale } from "@/locales";
import type { WalletTransaction } from "@/store";
import { formatCurrency, formatDateTime, formatSignedAmount } from "./format";
import type { FintechTheme } from "./theme";

export function StatusBadge({
  label,
  variant,
  isDark,
}: {
  label: string;
  variant: "active" | "pending" | "neutral";
  isDark: boolean;
}) {
  const styles =
    variant === "active"
      ? isDark
        ? "bg-primary-500/15 text-primary-300 ring-primary-500/30"
        : "bg-primary-100 text-primary-800 ring-primary-200"
      : variant === "pending"
        ? isDark
          ? "bg-amber-500/10 text-amber-400/90 ring-amber-500/25"
          : "bg-amber-50 text-amber-800 ring-amber-200"
        : isDark
          ? "bg-zinc-800 text-zinc-400 ring-zinc-700"
          : "bg-zinc-100 text-zinc-600 ring-zinc-200";

  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${styles}`}>
      {label}
    </span>
  );
}

export function campaignStatusVariant(status: string): "active" | "pending" | "neutral" {
  const s = status.toUpperCase();
  if (s.includes("ACTIVE") || s.includes("LIVE") || s.includes("FUND") || s.includes("APPROVED")) return "active";
  if (s.includes("PENDING") || s.includes("REVIEW") || s.includes("DRAFT")) return "pending";
  return "neutral";
}

function txStatusLabel(tx: WalletTransaction, completed: string, pending: string) {
  const hint = `${tx.entryType} ${tx.referenceType}`.toUpperCase();
  return hint.includes("PENDING") ? pending : completed;
}

export function KpiCard({
  label,
  value,
  highlighted,
  theme,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
  theme: FintechTheme;
}) {
  return (
    <article className={`p-5 ${theme.card} ${highlighted ? theme.cardHighlight : ""}`}>
      <p className={theme.label}>{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-tight tabular-nums ${theme.value}`}>{value}</p>
    </article>
  );
}

export function WalletActivityItem({
  tx,
  locale,
  theme,
  completedLabel,
  pendingLabel,
}: {
  tx: WalletTransaction;
  locale: Locale;
  theme: FintechTheme;
  completedLabel: string;
  pendingLabel: string;
}) {
  const isCredit = tx.signedAmount > 0;
  const title = tx.displayLabel?.trim() || tx.description?.trim() || tx.entryType;
  const status = txStatusLabel(tx, completedLabel, pendingLabel);
  const isPending = status === pendingLabel;

  return (
    <li className={`flex items-center gap-4 border-b px-5 py-4 last:border-b-0 ${theme.divider} ${theme.rowHover}`}>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          isCredit ? theme.accentBg : "bg-zinc-800 text-zinc-400"
        }`}
        aria-hidden
      >
        {isCredit ? <Wallet className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold ${theme.value}`}>{title}</p>
        <p className={`mt-0.5 text-xs ${theme.muted}`}>{formatDateTime(tx.occurredAt, locale)}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold tabular-nums ${isCredit ? theme.accent : theme.value}`}>
          {formatSignedAmount(tx.signedAmount, locale)}
        </p>
        <p className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${isPending ? "text-amber-500/90" : theme.muted}`}>
          {status}
        </p>
      </div>
    </li>
  );
}

export function DashboardErrorCard({
  title,
  description,
  retryLabel,
  onRetry,
  theme,
}: {
  title: string;
  description: string;
  retryLabel: string;
  onRetry: () => void;
  theme: FintechTheme;
}) {
  return (
    <div className={`p-6 ${theme.card}`}>
      <p className={`font-semibold ${theme.value}`}>{title}</p>
      <p className={`mt-2 text-sm ${theme.muted}`}>{description}</p>
      <button type="button" onClick={onRetry} className={`mt-4 ${theme.btnPrimary}`}>
        {retryLabel}
      </button>
    </div>
  );
}

export function KpiGridSkeleton({ theme }: { theme: FintechTheme }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`h-24 animate-pulse ${theme.card}`} />
      ))}
    </div>
  );
}
