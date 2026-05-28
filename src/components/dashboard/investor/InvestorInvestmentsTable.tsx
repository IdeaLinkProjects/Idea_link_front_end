import { formatEtb } from "@/lib/format/formatEtb";
import type { Locale } from "@/locales";
import type { UserInvestmentItem } from "@/store/api/paymentsApi";

type InvestorInvestmentsTableText = {
  campaign: string;
  amount: string;
  shares: string;
  status: string;
  invested: string;
  coolingOff: string;
  actions: string;
  detail: string;
  cancel: string;
  withdraw: string;
  empty: string;
};

type InvestorInvestmentsTableProps = {
  rows: UserInvestmentItem[];
  isDark: boolean;
  locale: Locale;
  isLoading: boolean;
  text: InvestorInvestmentsTableText;
  onOpenDetail: (investmentId: number) => void;
  onCancel: (investmentId: number) => void;
  onWithdraw: (investmentId: number) => void;
  formatDate: (iso: string | null | undefined) => string;
};

export function InvestorInvestmentsTable({
  rows,
  isDark,
  locale,
  isLoading,
  text,
  onOpenDetail,
  onCancel,
  onWithdraw,
  formatDate,
}: InvestorInvestmentsTableProps) {
  return (
    <table className="w-full min-w-[920px] text-left text-sm">
      <thead className={isDark ? "bg-zinc-900/80" : "bg-zinc-50"}>
        <tr>
          <th className="px-4 py-3 font-semibold">{text.campaign}</th>
          <th className="px-4 py-3 font-semibold">{text.amount}</th>
          <th className="px-4 py-3 font-semibold">{text.shares}</th>
          <th className="px-4 py-3 font-semibold">{text.status}</th>
          <th className="px-4 py-3 font-semibold">{text.invested}</th>
          <th className="px-4 py-3 font-semibold">{text.coolingOff}</th>
          <th className="px-4 py-3 text-right font-semibold">{text.actions}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((item) => {
          const statusUpper = item.status.toUpperCase();
          const canCancel = statusUpper.includes("PENDING");
          const canWithdraw = item.withdrawalEligible;
          return (
            <tr key={item.id} className={isDark ? "border-t border-white/10" : "border-t border-zinc-200"}>
              <td className="px-4 py-3">
                <p className="font-semibold">{item.campaign.title}</p>
                <p className={isDark ? "text-zinc-400" : "text-zinc-500"}>#{item.id}</p>
              </td>
              <td className="px-4 py-3">{formatEtb(item.amount, locale)} ETB</td>
              <td className="px-4 py-3">{item.sharesPurchased.toLocaleString()}</td>
              <td className="px-4 py-3">{item.status}</td>
              <td className="px-4 py-3">{formatDate(item.investmentDate)}</td>
              <td className="px-4 py-3">{formatDate(item.coolingOffExpiry)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenDetail(item.id)}
                    className="rounded-lg border border-primary-500/40 px-3 py-1.5 font-medium text-primary-500 hover:bg-primary-500/10"
                  >
                    {text.detail}
                  </button>
                  <button
                    type="button"
                    disabled={!canCancel}
                    onClick={() => onCancel(item.id)}
                    className="rounded-lg border border-amber-500/40 px-3 py-1.5 font-medium text-amber-500 disabled:opacity-40"
                  >
                    {text.cancel}
                  </button>
                  <button
                    type="button"
                    disabled={!canWithdraw}
                    onClick={() => onWithdraw(item.id)}
                    className="rounded-lg border border-emerald-500/40 px-3 py-1.5 font-medium text-emerald-500 disabled:opacity-40"
                  >
                    {text.withdraw}
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
        {!isLoading && rows.length === 0 ? (
          <tr>
            <td colSpan={7} className={`px-4 py-10 text-center ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              {text.empty}
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}
