import Head from "next/head";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { EmptyWalletState } from "@/components/wallet/components/EmptyWalletState";
import { WalletSummaryCard } from "@/components/wallet/components/WalletSummaryCard";
import { WithdrawModal } from "@/components/wallet/components/WithdrawModal";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { resolveBankByCode } from "@/components/wallet/components/BankSelector";
import {
  useGetCompanyBankAccountQuery,
  useGetMyCompanyQuery,
  useGetChapaBanksQuery,
  useGetWalletBalanceQuery,
  useWithdrawCompanyFundsMutation,
} from "@/store";

export default function WithdrawFundsPage() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].walletPage;
  const companyQuery = useGetMyCompanyQuery();
  const companyId = companyQuery.data?.id;
  const balanceQuery = useGetWalletBalanceQuery(companyId ?? 0, { skip: !companyId });
  const bankQuery = useGetCompanyBankAccountQuery(companyId ?? 0, { skip: !companyId });
  const banksQuery = useGetChapaBanksQuery();
  const [withdraw, withdrawState] = useWithdrawCompanyFundsMutation();

  const [amount, setAmount] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const balance = balanceQuery.data?.balance ?? 0;
  const parsedAmount = Number(amount);
  const bank = bankQuery.data;
  const bankName = resolveBankByCode(banksQuery.data, bank?.bankCode)?.name ?? bank?.bankCode ?? "-";

  const validationError = useMemo(() => {
    if (!amount.trim()) return "";
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return "Enter a valid withdrawal amount.";
    if (parsedAmount > balance) return "Insufficient balance.";
    return "";
  }, [amount, balance, parsedAmount]);

  const canWithdraw = Boolean(
    companyId &&
      bank &&
      bank.verified &&
      balance > 0 &&
      !validationError &&
      Number.isFinite(parsedAmount) &&
      parsedAmount > 0,
  );

  const submitWithdraw = async () => {
    if (!companyId || !canWithdraw) return;
    setNotice(null);
    try {
      await withdraw({ companyId, body: { amount: parsedAmount } }).unwrap();
      setOpenConfirm(false);
      setAmount("");
      setNotice({ tone: "ok", text: t.withdraw.success });
      void balanceQuery.refetch();
    } catch (err) {
      setNotice({ tone: "err", text: extractApiErrorMessage(err, t.withdraw.error) });
    }
  };

  return (
    <>
      <Head>
        <title>{t.withdraw.metaTitle}</title>
      </Head>
      <DashboardLayout>
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <DashboardPageHeader title={t.withdraw.title} subtitle={t.withdraw.subtitle} />
          {!companyId ? (
            <EmptyWalletState title={t.noCompany} description={t.withdraw.subtitle} ctaLabel={t.setupCompany} href="/dashboard/company" />
          ) : !bank ? (
            <EmptyWalletState
              title={t.withdraw.noBankTitle}
              description={t.withdraw.noBankDescription}
              ctaLabel={t.withdraw.addBankCta}
              href="/dashboard/wallet/bank-account"
            />
          ) : balance <= 0 ? (
            <EmptyWalletState title={t.withdraw.emptyWalletTitle} description={t.withdraw.emptyWalletDescription} ctaLabel={t.dashboard.refresh} href="/dashboard/wallet" />
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">{t.withdraw.availableBalance}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{balance.toLocaleString()} ETB</p>
                <p className="mt-3 text-sm text-slate-600">
                  {t.withdraw.destination}:{" "}
                  <span className="font-semibold text-slate-900">
                    {bankName} ({bank.maskedAccountNumber})
                  </span>
                </p>

                {!bank.verified ? <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">{t.withdraw.unverifiedWarning}</p> : null}

                <label className="mt-5 block space-y-1 text-sm text-slate-700">
                  <span>{t.withdraw.amountLabel}</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </label>
                {validationError ? <p className="mt-2 text-sm text-red-600">{validationError}</p> : null}

                <button
                  type="button"
                  disabled={!canWithdraw || withdrawState.isLoading || !bank.verified}
                  onClick={() => setOpenConfirm(true)}
                  className="mt-5 rounded-lg bg-primary-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t.withdraw.submit}
                </button>
                {notice ? (
                  <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${notice.tone === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {notice.text}
                  </p>
                ) : null}
              </section>
              <WalletSummaryCard
                balance={balance}
                bankName={bankName}
                maskedAccountNumber={bank.maskedAccountNumber}
              />
            </div>
          )}
        </div>
        <WithdrawModal
          open={openConfirm}
          amount={parsedAmount || 0}
          destination={`${bankName} (${bank?.maskedAccountNumber ?? "-"})`}
          isDark={isDark}
          isSubmitting={withdrawState.isLoading}
          onCancel={() => setOpenConfirm(false)}
          onConfirm={submitWithdraw}
        />
      </DashboardLayout>
    </>
  );
}
