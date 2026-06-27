import { Building2 } from "lucide-react";
import type { CompanyBankAccountResponse } from "@/store";
import { CHAPA_SUPPORTED_BANKS } from "./BankSelector";
import { VerificationBadge } from "./VerificationBadge";

type BankAccountCardProps = {
  account: CompanyBankAccountResponse | null;
};

export function BankAccountCard({ account }: BankAccountCardProps) {
  if (!account) {
    return (
      <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
        No bank account connected yet.
      </article>
    );
  }

  const bank = CHAPA_SUPPORTED_BANKS.find((item) => item.code === account.bankCode);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
            {bank?.logo ?? <Building2 className="h-5 w-5 text-slate-500" />}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{bank?.name ?? account.bankCode}</p>
            <p className="text-xs text-slate-500">{account.maskedAccountNumber}</p>
          </div>
        </div>
        <VerificationBadge verified={account.verified} />
      </div>
      <dl className="mt-4 grid gap-2 text-sm text-slate-700">
        <div className="flex justify-between gap-4">
          <dt>Account holder</dt>
          <dd className="font-medium">{account.accountHolderName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Default account</dt>
          <dd className="font-medium">{account.defaultAccount ? "Yes" : "No"}</dd>
        </div>
      </dl>
      {!account.verified ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">Your bank account is awaiting admin verification.</p> : null}
    </article>
  );
}
