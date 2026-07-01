import type { ChapaBank } from "@/store/api/paymentsApi";
import { useGetChapaBanksQuery } from "@/store";

export function bankCodeToString(code: number | string): string {
  return String(code);
}

export function resolveBankByCode(
  banks: ChapaBank[] | undefined,
  bankCode: string | undefined,
): ChapaBank | undefined {
  if (!bankCode || !banks?.length) return undefined;
  return banks.find((bank) => bankCodeToString(bank.code) === bankCode);
}

type BankSelectorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  loadingLabel?: string;
  banksLabel?: string;
  walletsLabel?: string;
};

export function BankSelector({
  id,
  value,
  onChange,
  disabled = false,
  placeholder = "Select a bank or wallet",
  loadingLabel = "Loading banks…",
  banksLabel = "Banks",
  walletsLabel = "Mobile wallets",
}: BankSelectorProps) {
  const banksQuery = useGetChapaBanksQuery();
  const payoutBanks = (banksQuery.data ?? []).filter((bank) => bank.canProcessPayouts);
  const bankAccounts = payoutBanks.filter((bank) => !bank.isMobileMoney);
  const mobileWallets = payoutBanks.filter((bank) => bank.isMobileMoney);

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || banksQuery.isLoading || banksQuery.isError}
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-primary-500 dark:focus:ring-primary-900/50 dark:disabled:bg-zinc-900"
    >
      <option value="">{banksQuery.isLoading ? loadingLabel : placeholder}</option>
      {bankAccounts.length > 0 ? (
        <optgroup label={banksLabel}>
          {bankAccounts.map((bank) => (
            <option key={bank.code} value={bankCodeToString(bank.code)}>
              {bank.name}
            </option>
          ))}
        </optgroup>
      ) : null}
      {mobileWallets.length > 0 ? (
        <optgroup label={walletsLabel}>
          {mobileWallets.map((bank) => (
            <option key={bank.code} value={bankCodeToString(bank.code)}>
              {bank.name}
            </option>
          ))}
        </optgroup>
      ) : null}
    </select>
  );
}
