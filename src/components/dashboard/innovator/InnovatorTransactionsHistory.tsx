import type { RefObject } from "react";
import { DashboardPagination } from "@/components/ui/DashboardPagination";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import type { Locale } from "@/locales";
import type { WalletTransaction } from "@/store";
import { DashboardErrorCard } from "./dashboardUi";
import { InnovatorWalletActivityCard } from "./InnovatorWalletActivityCard";
import type { FintechTheme } from "./theme";

type InnovatorTransactionsHistoryProps = {
  sectionRef: RefObject<HTMLDivElement | null>;
  title: string;
  transactions: WalletTransaction[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  locale: Locale;
  isDark: boolean;
  theme: FintechTheme;
  labels: {
    empty: string;
    loadErrorTitle: string;
    loadErrorDescription: string;
    retry: string;
    statusCompleted: string;
    statusPending: string;
    paginationPrevious: string;
    paginationNext: string;
  };
};

export function InnovatorTransactionsHistory({
  sectionRef,
  title,
  transactions,
  isLoading,
  isError,
  error,
  onRetry,
  currentPage,
  totalPages,
  onPageChange,
  locale,
  isDark,
  theme,
  labels,
}: InnovatorTransactionsHistoryProps) {
  return (
    <div ref={sectionRef} className="scroll-mt-8 space-y-4">
      <h2 className={`text-sm font-bold uppercase tracking-wider ${theme.value}`}>{title}</h2>

      {isError ? (
        <DashboardErrorCard
          title={labels.loadErrorTitle}
          description={extractApiErrorMessage(error, labels.loadErrorDescription)}
          retryLabel={labels.retry}
          onRetry={onRetry}
          theme={theme}
        />
      ) : null}

      {isLoading ? <div className={`h-48 animate-pulse ${theme.card}`} /> : null}

      {!isLoading && !isError ? (
        <>
          <InnovatorWalletActivityCard
            title=""
            showHeader={false}
            transactions={transactions}
            emptyMessage={labels.empty}
            locale={locale}
            theme={theme}
            statusLabels={{ completed: labels.statusCompleted, pending: labels.statusPending }}
          />
          <DashboardPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            isDark={isDark}
            previousLabel={labels.paginationPrevious}
            nextLabel={labels.paginationNext}
          />
        </>
      ) : null}
    </div>
  );
}
