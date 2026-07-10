import Head from "next/head";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { BankAccountCard } from "@/components/wallet/components/BankAccountCard";
import { ChapaWalletTopUpPanel } from "@/components/wallet/components/ChapaWalletTopUpPanel";
import { EmptyWalletState } from "@/components/wallet/components/EmptyWalletState";
import { WalletBalanceCard } from "@/components/wallet/components/WalletBalanceCard";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { useGetCompanyBankAccountQuery, useGetMyCompanyQuery, useGetWalletBalanceQuery } from "@/store";

export default function WalletDashboardPage() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].walletPage;
  const companyQuery = useGetMyCompanyQuery();
  const companyId = companyQuery.data?.id;
  const balanceQuery = useGetWalletBalanceQuery(companyId ?? 0, { skip: !companyId });
  const bankQuery = useGetCompanyBankAccountQuery(companyId ?? 0, { skip: !companyId });

  const errorMessage = balanceQuery.isError
    ? extractApiErrorMessage(balanceQuery.error, t.dashboard.loadError)
    : bankQuery.isError
      ? extractApiErrorMessage(bankQuery.error, t.dashboard.loadError)
      : "";

  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";

  return (
    <>
      <Head>
        <title>{t.dashboard.metaTitle}</title>
      </Head>
      <DashboardLayout>
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <DashboardPageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />

          {!companyId ? (
            <EmptyWalletState
              title={t.noCompany}
              description={t.dashboard.subtitle}
              ctaLabel={t.setupCompany}
              href="/dashboard/company"
            />
          ) : (
            <>
              <WalletBalanceCard
                balance={balanceQuery.data?.balance ?? 0}
                currency={balanceQuery.data?.currency ?? "ETB"}
                loading={balanceQuery.isFetching}
                onRefresh={() => {
                  void balanceQuery.refetch();
                  void bankQuery.refetch();
                }}
                verifiedBank={Boolean(bankQuery.data?.verified)}
                quickWithdrawHref="/dashboard/wallet/withdraw"
              />

              {errorMessage ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}

              <div className={`rounded-2xl border p-8 ${cardClass}`}>
                <ChapaWalletTopUpPanel
                  isDark={isDark}
                  balance={balanceQuery.data?.balance ?? 0}
                  loadingWallet={balanceQuery.isFetching}
                  onVerified={async () => {
                    await balanceQuery.refetch();
                  }}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <BankAccountCard account={bankQuery.data ?? null} />
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">{t.dashboard.bankStatus}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {bankQuery.data ? (bankQuery.data.verified ? t.badges.verified : t.dashboard.pendingVerification) : t.dashboard.noBank}
                  </p>
                  <Link href="/dashboard/wallet/bank-account" className="mt-4 inline-flex rounded-lg bg-primary-950 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-900">
                    {bankQuery.data ? t.dashboard.manageBank : t.dashboard.addBank}
                  </Link>
                </article>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
