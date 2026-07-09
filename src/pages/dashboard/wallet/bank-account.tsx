import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { BankSelector, resolveBankByCode } from "@/components/wallet/components/BankSelector";
import { VerificationBadge } from "@/components/wallet/components/VerificationBadge";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import type { ChapaBank } from "@/store/api/paymentsApi";
import {
  useGetCompanyBankAccountQuery,
  useGetChapaBanksQuery,
  useGetMyCompanyQuery,
  useUpsertCompanyBankAccountMutation,
} from "@/store";

function validateAccountNumber(
  accountNumber: string,
  bank: ChapaBank | undefined,
  messages: {
    accountNumberRequired: string;
    digitsOnly: string;
    phoneLengthError: string;
    accountLengthError: string;
  },
): string | null {
  const trimmed = accountNumber.trim();
  if (!trimmed) return messages.accountNumberRequired;
  if (!/^\d+$/.test(trimmed)) return messages.digitsOnly;
  if (!bank) return null;
  if (trimmed.length !== bank.acctLength) {
    const template = bank.isMobileMoney ? messages.phoneLengthError : messages.accountLengthError;
    return template.replace("{length}", String(bank.acctLength));
  }
  return null;
}

export default function BankAccountPage() {
  const { locale } = useAppPreferences();
  const t = messages[locale].walletPage;
  const companyQuery = useGetMyCompanyQuery();
  const companyId = companyQuery.data?.id;
  const bankQuery = useGetCompanyBankAccountQuery(companyId ?? 0, { skip: !companyId });
  const banksQuery = useGetChapaBanksQuery();
  const [upsert, upsertState] = useUpsertCompanyBankAccountMutation();

  const [form, setForm] = useState({
    accountHolderName: "",
    bankCode: "",
    accountNumber: "",
    defaultAccount: true,
  });
  const [hydratedFromApi, setHydratedFromApi] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const existingAccount = bankQuery.data;
  const isEditing = Boolean(existingAccount);

  useEffect(() => {
    if (!existingAccount || hydratedFromApi) return;
    setForm({
      accountHolderName: existingAccount.accountHolderName,
      bankCode: existingAccount.bankCode,
      accountNumber: "",
      defaultAccount: existingAccount.defaultAccount,
    });
    setHydratedFromApi(true);
  }, [existingAccount, hydratedFromApi]);

  const selectedBank = useMemo(
    () => resolveBankByCode(banksQuery.data, form.bankCode),
    [banksQuery.data, form.bankCode],
  );

  const isMobileWallet = Boolean(selectedBank?.isMobileMoney);
  const accountNumberLabel = isMobileWallet ? t.bankAccount.phoneNumber : t.bankAccount.accountNumber;
  const accountNumberHint = selectedBank
    ? (isMobileWallet ? t.bankAccount.phoneNumberHint : t.bankAccount.accountNumberHint).replace(
        "{length}",
        String(selectedBank.acctLength),
      )
    : null;

  const submit = async () => {
    if (!companyId) return;
    setNotice(null);

    const accountHolderName = form.accountHolderName.trim();
    const bankCode = form.bankCode.trim();
    const accountNumber = form.accountNumber.trim();

    if (!accountHolderName || !bankCode) {
      setNotice({ tone: "err", text: t.bankAccount.validationRequired });
      return;
    }

    const accountNumberError = validateAccountNumber(accountNumber, selectedBank, {
      accountNumberRequired: t.bankAccount.accountNumberRequired,
      digitsOnly: t.bankAccount.digitsOnly,
      phoneLengthError: t.bankAccount.phoneLengthError,
      accountLengthError: t.bankAccount.accountLengthError,
    });
    if (accountNumberError) {
      setNotice({ tone: "err", text: accountNumberError });
      return;
    }

    try {
      await upsert({
        companyId,
        body: {
          accountHolderName,
          bankCode,
          accountNumber,
          defaultAccount: form.defaultAccount,
        },
      }).unwrap();
      setForm((prev) => ({ ...prev, accountNumber: "" }));
      setHydratedFromApi(false);
      setNotice({ tone: "ok", text: t.bankAccount.saveSuccess });
      void bankQuery.refetch();
    } catch (err) {
      setNotice({ tone: "err", text: extractApiErrorMessage(err, t.bankAccount.saveError) });
    }
  };

  return (
    <>
      <Head>
        <title>{t.bankAccount.metaTitle}</title>
      </Head>
      <DashboardLayout>
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <DashboardPageHeader title={t.bankAccount.title} subtitle={t.bankAccount.subtitle} />
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-lg dark:shadow-black/20">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {isEditing ? t.bankAccount.updateTitle : t.bankAccount.addTitle}
              </h2>
              {existingAccount ? <VerificationBadge verified={existingAccount.verified} /> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-700 dark:text-zinc-200">
                <span>{t.bankAccount.accountHolder}</span>
                <input
                  value={form.accountHolderName}
                  onChange={(e) => setForm((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-primary-500 dark:focus:ring-primary-900/50"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-700 dark:text-zinc-200">
                <span>{t.bankAccount.bank}</span>
                <BankSelector
                  id="bank-code"
                  value={form.bankCode}
                  onChange={(value) => setForm((prev) => ({ ...prev, bankCode: value }))}
                  placeholder={t.bankAccount.selectBank}
                  loadingLabel={t.bankAccount.loadingBanks}
                  banksLabel={t.bankAccount.banksGroup}
                  walletsLabel={t.bankAccount.walletsGroup}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-700 dark:text-zinc-200 sm:col-span-2">
                <span>{accountNumberLabel}</span>
                <input
                  type={isMobileWallet ? "tel" : "text"}
                  inputMode="numeric"
                  value={form.accountNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, "") }))}
                  maxLength={selectedBank?.acctLength}
                  placeholder={
                    isEditing && existingAccount?.maskedAccountNumber
                      ? t.bankAccount.accountNumberEditPlaceholder.replace("{masked}", existingAccount.maskedAccountNumber)
                      : undefined
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-primary-500 dark:focus:ring-primary-900/50"
                />
              </label>
            </div>

            {accountNumberHint ? (
              <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400">{accountNumberHint}</p>
            ) : null}

            <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={form.defaultAccount}
                onChange={(e) => setForm((prev) => ({ ...prev, defaultAccount: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-primary-700"
              />
              <span>{t.bankAccount.defaultAccount}</span>
            </label>

            {existingAccount?.verifiedAt ? (
              <p className="mt-3 text-xs text-emerald-700 dark:text-emerald-400">
                {t.bankAccount.verifiedAt}: {new Date(existingAccount.verifiedAt).toLocaleString()}
              </p>
            ) : null}
            {existingAccount && !existingAccount.verified ? (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                {t.bankAccount.pendingMessage}
              </p>
            ) : null}
            {existingAccount?.verified ? (
              <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-zinc-800/60 dark:text-zinc-300">
                {t.bankAccount.verifiedEditHint}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => void submit()}
              disabled={upsertState.isLoading || !companyId}
              className="mt-5 rounded-lg bg-primary-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-900 disabled:opacity-60"
            >
              {upsertState.isLoading
                ? t.bankAccount.saving
                : isEditing
                  ? t.bankAccount.updateButton
                  : t.bankAccount.saveButton}
            </button>

            {notice ? (
              <p
                className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                  notice.tone === "ok"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {notice.text}
              </p>
            ) : null}
          </section>
        </div>
      </DashboardLayout>
    </>
  );
}
