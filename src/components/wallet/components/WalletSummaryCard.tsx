type WalletSummaryCardProps = {
  balance: number;
  maskedAccountNumber: string;
  bankName: string;
};

export function WalletSummaryCard({ balance, maskedAccountNumber, bankName }: WalletSummaryCardProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Transaction summary</h3>
      <dl className="mt-3 space-y-2 text-sm text-slate-700">
        <div className="flex items-center justify-between gap-4">
          <dt>Available balance</dt>
          <dd className="font-semibold">{balance.toLocaleString()} ETB</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt>Destination bank</dt>
          <dd className="font-medium">{bankName}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt>Account</dt>
          <dd className="font-medium">{maskedAccountNumber}</dd>
        </div>
      </dl>
    </aside>
  );
}
