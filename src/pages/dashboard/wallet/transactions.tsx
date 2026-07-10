import Head from "next/head";
import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { useFintechTheme } from "@/components/dashboard/fintechTheme";
import { DashboardErrorCard } from "@/components/dashboard/innovator/dashboardUi";
import { formatCurrency, formatDateTime, formatSignedAmount } from "@/components/dashboard/innovator/format";
import { DashboardPagination } from "@/components/ui/DashboardPagination";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import { useGetInnovatorWalletTransactionsQuery, type WalletTransaction } from "@/store";

const PAGE_SIZE = 10;

function TransactionRow({
  tx,
  locale,
  isDark,
  labels,
}: {
  tx: WalletTransaction;
  locale: "en" | "am";
  isDark: boolean;
  labels: {
    balanceAfter: string;
    reference: string;
  };
}) {
  const isCredit = tx.signedAmount > 0;
  const title = tx.displayLabel?.trim() || tx.description?.trim() || tx.entryType;
  const category = tx.displayCategory?.trim() || tx.entryType;
  const muted = isDark ? "text-zinc-500" : "text-zinc-500";
  const value = isDark ? "text-zinc-100" : "text-zinc-900";
  const accent = isDark ? "text-primary-300" : "text-primary-800";
  const iconWrap = isCredit
    ? isDark
      ? "bg-primary-500/15 text-primary-300"
      : "bg-primary-50 text-primary-800"
    : isDark
      ? "bg-zinc-800 text-zinc-400"
      : "bg-zinc-100 text-zinc-600";

  return (
    <li
      className={`flex flex-col gap-3 border-b px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:px-5 ${
        isDark ? "border-zinc-800 hover:bg-zinc-800/40" : "border-zinc-200 hover:bg-zinc-50"
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconWrap}`} aria-hidden>
        {isCredit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
      </span>

      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold ${value}`}>{title}</p>
        <p className={`mt-0.5 text-xs ${muted}`}>
          {category}
          {tx.description && tx.description !== title ? ` · ${tx.description}` : ""}
        </p>
        <p className={`mt-1 text-xs ${muted}`}>{formatDateTime(tx.occurredAt, locale)}</p>
        {tx.transactionReference ? (
          <p className={`mt-1 truncate font-mono text-[11px] ${muted}`}>
            {labels.reference}: {tx.transactionReference}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 text-left sm:text-right">
        <p className={`text-sm font-bold tabular-nums ${isCredit ? accent : value}`}>
          {formatSignedAmount(tx.signedAmount, locale)}
        </p>
        <p className={`mt-1 text-xs ${muted}`}>
          {labels.balanceAfter}: {formatCurrency(tx.balanceAfter, locale)}
        </p>
      </div>
    </li>
  );
}

export default function WalletTransactionHistoryPage() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].walletPage;
  const theme = useFintechTheme(isDark);
  const [page, setPage] = useState(0);

  const query = useGetInnovatorWalletTransactionsQuery({ page, size: PAGE_SIZE });
  const transactions = useMemo(() => query.data?.content ?? [], [query.data?.content]);
  const totalPages = query.data?.totalPages ?? 0;

  return (
    <>
      <Head>
        <title>{t.transactions.metaTitle}</title>
      </Head>
      <DashboardLayout>
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <DashboardPageHeader title={t.transactions.title} subtitle={t.transactions.subtitle} />

          {query.isError ? (
            <DashboardErrorCard
              title={t.transactions.loadErrorTitle}
              description={extractApiErrorMessage(query.error, t.transactions.loadErrorDescription)}
              retryLabel={t.transactions.retry}
              onRetry={() => void query.refetch()}
              theme={theme}
            />
          ) : null}

          {query.isLoading ? <div className={`h-64 animate-pulse ${theme.card}`} /> : null}

          {!query.isLoading && !query.isError ? (
            <>
              <section className={`${theme.card} ${query.isFetching ? "opacity-70" : ""}`}>
                {transactions.length === 0 ? (
                  <p className={`px-5 py-12 text-center text-sm ${theme.muted}`}>{t.transactions.empty}</p>
                ) : (
                  <ul>
                    {transactions.map((tx) => (
                      <TransactionRow
                        key={tx.id}
                        tx={tx}
                        locale={locale}
                        isDark={isDark}
                        labels={{
                          balanceAfter: t.transactions.balanceAfter,
                          reference: t.transactions.reference,
                        }}
                      />
                    ))}
                  </ul>
                )}
              </section>

              <DashboardPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                isDark={isDark}
                previousLabel={t.transactions.paginationPrevious}
                nextLabel={t.transactions.paginationNext}
              />
            </>
          ) : null}
        </div>
      </DashboardLayout>
    </>
  );
}
