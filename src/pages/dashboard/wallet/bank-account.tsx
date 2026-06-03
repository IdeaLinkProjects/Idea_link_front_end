import Head from "next/head";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { BankSelector, CHAPA_SUPPORTED_BANKS } from "@/components/wallet/components/BankSelector";
import { VerificationBadge } from "@/components/wallet/components/VerificationBadge";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { useGetCompanyBankAccountQuery, useGetMyCompanyQuery, useUpsertCompanyBankAccountMutation } from "@/store";

export default function BankAccountPage() {
  const { locale } = useAppPreferences();
  const t = messages[locale].walletPage;
  const companyQuery = useGetMyCompanyQuery();
  const companyId = companyQuery.data?.id;
  const bankQuery = useGetCompanyBankAccountQuery(companyId ?? 0, { skip: !companyId });
  const [upsert, upsertState] = useUpsertCompanyBankAccountMutation();

  const [form, setForm] = useState({
    accountHolderName: "",
    bankCode: "",
    accountNumber: "",
    defaultAccount: null as boolean | null,
  });
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const isVerified = Boolean(bankQuery.data?.verified);
  const canEditSensitive = !isVerified;
  const resolvedAccountHolderName = form.accountHolderName || bankQuery.data?.accountHolderName || "";
  const resolvedBankCode = form.bankCode || bankQuery.data?.bankCode || "";
  const resolvedDefaultAccount = form.defaultAccount ?? bankQuery.data?.defaultAccount ?? true;
  const selectedBankName = useMemo(
    () => CHAPA_SUPPORTED_BANKS.find((bank) => bank.code === resolvedBankCode)?.name ?? resolvedBankCode,
    [resolvedBankCode],
  );

  const submit = async () => {
    if (!companyId) return;
    setNotice(null);
    if (!resolvedAccountHolderName.trim() || !resolvedBankCode || !form.accountNumber.trim()) {
      setNotice({ tone: "err", text: "Please fill all required fields." });
      return;
    }
    if (!/^\d{8,20}$/.test(form.accountNumber.trim())) {
      setNotice({ tone: "err", text: "Account number must be 8-20 digits." });
      return;
    }
    try {
      await upsert({
        companyId,
        body: {
          accountHolderName: resolvedAccountHolderName.trim(),
          bankCode: resolvedBankCode,
          accountNumber: form.accountNumber.trim(),
          defaultAccount: resolvedDefaultAccount,
        },
      }).unwrap();
      setForm((prev) => ({ ...prev, accountNumber: "" }));
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
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                {bankQuery.data ? t.bankAccount.updateTitle : t.bankAccount.addTitle}
              </h2>
              {bankQuery.data ? <VerificationBadge verified={bankQuery.data.verified} /> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-700">
                <span>{t.bankAccount.accountHolder}</span>
                <input
                  value={resolvedAccountHolderName}
                  onChange={(e) => setForm((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                  disabled={!canEditSensitive}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:bg-slate-100"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-700">
                <span>{t.bankAccount.bank}</span>
                <BankSelector
                  id="bank-code"
                  value={resolvedBankCode}
                  onChange={(value) => setForm((prev) => ({ ...prev, bankCode: value }))}
                  disabled={!canEditSensitive}
                />
              </label>
              <label className="space-y-1 text-sm text-slate-700 sm:col-span-2">
                <span>{t.bankAccount.accountNumber}</span>
                <input
                  value={form.accountNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                  disabled={!canEditSensitive}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:bg-slate-100"
                />
              </label>
            </div>

            <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={resolvedDefaultAccount}
                onChange={(e) => setForm((prev) => ({ ...prev, defaultAccount: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-primary-700"
              />
              <span>{t.bankAccount.defaultAccount}</span>
            </label>

            {bankQuery.data?.verifiedAt ? (
              <p className="mt-3 text-xs text-emerald-700">
                {t.bankAccount.verifiedAt}: {new Date(bankQuery.data.verifiedAt).toLocaleString()}
              </p>
            ) : null}
            {bankQuery.data && !bankQuery.data.verified ? <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{t.bankAccount.pendingMessage}</p> : null}
            {isVerified ? <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{t.bankAccount.verifiedEditHint}</p> : null}
            {selectedBankName ? <p className="mt-2 text-xs text-slate-500">Selected bank: {selectedBankName}</p> : null}

            <button
              type="button"
              onClick={() => void submit()}
              disabled={upsertState.isLoading || !companyId}
              className="mt-5 rounded-lg bg-primary-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-900 disabled:opacity-60"
            >
              {upsertState.isLoading
                ? t.bankAccount.saving
                : bankQuery.data
                  ? t.bankAccount.updateButton
                  : t.bankAccount.saveButton}
            </button>

            {notice ? (
              <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${notice.tone === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {notice.text}
              </p>
            ) : null}
          </section>
        </div>
      </DashboardLayout>
    </>
  );
}
