export type SupportedBank = {
  code: string;
  name: string;
  logo: string;
};

export const CHAPA_SUPPORTED_BANKS: SupportedBank[] = [
  { code: "CBE", name: "Commercial Bank of Ethiopia", logo: "🏦" },
  { code: "AWASH", name: "Awash Bank", logo: "🟠" },
  { code: "ABYSSINIA", name: "Bank of Abyssinia", logo: "🟣" },
  { code: "DASHEN", name: "Dashen Bank", logo: "🔵" },
  { code: "HIBRET", name: "Hibret Bank", logo: "🟢" },
  { code: "WEGAGEN", name: "Wegagen Bank", logo: "🟡" },
];

type BankSelectorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function BankSelector({ id, value, onChange, disabled = false }: BankSelectorProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-100"
    >
      <option value="">Select a bank</option>
      {CHAPA_SUPPORTED_BANKS.map((bank) => (
        <option key={bank.code} value={bank.code}>
          {bank.logo} {bank.name}
        </option>
      ))}
    </select>
  );
}
