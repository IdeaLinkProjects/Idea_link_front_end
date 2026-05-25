import type { Locale } from "@/locales";
import type { WalletTransaction } from "@/store";
import { WalletActivityItem } from "./dashboardUi";
import type { FintechTheme } from "./theme";

type InnovatorWalletActivityCardProps = {
  title: string;
  transactions: WalletTransaction[];
  emptyMessage: string;
  viewHistoryLabel?: string;
  onViewHistory?: () => void;
  locale: Locale;
  theme: FintechTheme;
  statusLabels: { completed: string; pending: string };
  showHeader?: boolean;
};

function WalletActivityList({
  transactions,
  emptyMessage,
  locale,
  theme,
  statusLabels,
}: Pick<InnovatorWalletActivityCardProps, "transactions" | "emptyMessage" | "locale" | "theme" | "statusLabels">) {
  if (transactions.length === 0) {
    return <p className={`px-5 py-10 text-center text-sm ${theme.muted}`}>{emptyMessage}</p>;
  }

  return (
    <ul>
      {transactions.map((tx) => (
        <WalletActivityItem
          key={tx.id}
          tx={tx}
          locale={locale}
          theme={theme}
          completedLabel={statusLabels.completed}
          pendingLabel={statusLabels.pending}
        />
      ))}
    </ul>
  );
}

export function InnovatorWalletActivityCard({
  title,
  transactions,
  emptyMessage,
  viewHistoryLabel,
  onViewHistory,
  locale,
  theme,
  statusLabels,
  showHeader = true,
}: InnovatorWalletActivityCardProps) {
  return (
    <div className={theme.card}>
      {showHeader ? (
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${theme.divider}`}>
          <h2 className={`text-sm font-bold uppercase tracking-wider ${theme.value}`}>{title}</h2>
          {viewHistoryLabel && onViewHistory ? (
            <button
              type="button"
              onClick={onViewHistory}
              className={theme.link}
            >
              {viewHistoryLabel} →
            </button>
          ) : null}
        </div>
      ) : null}
      <WalletActivityList
        transactions={transactions}
        emptyMessage={emptyMessage}
        locale={locale}
        theme={theme}
        statusLabels={statusLabels}
      />
    </div>
  );
}
