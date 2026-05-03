import { KYC_STATUS } from "@/constants/kycStatus";
import { messages } from "@/locales";
import type { RolePrerequisites } from "@/store";

type DashboardProfileMessages = (typeof messages)["en"]["dashboardProfilePage"];

type DashboardProfilePrereqChipsProps = {
  title: string;
  pre: RolePrerequisites;
  t: DashboardProfileMessages;
  isDark: boolean;
};

export function DashboardProfilePrereqChips({ title, pre, t, isDark }: DashboardProfilePrereqChipsProps) {
  const row = (ok: boolean, label: string) => (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          ok ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-500/20 text-zinc-500"
        }`}
      >
        {ok ? "✓" : "·"}
      </span>
      <span className={isDark ? "text-zinc-300" : "text-zinc-700"}>{label}</span>
    </div>
  );

  const kycState = pre.kycStatus?.trim() ?? "";
  const kycVerified = kycState === KYC_STATUS.VERIFIED;
  const kycPending = kycState === KYC_STATUS.PENDING;
  const kycLabel = kycVerified ? t.chkKycVerified : kycPending ? t.chkKycPending : t.chkKycNotSubmitted;
  const kycIconClass = kycVerified
    ? "bg-emerald-500/20 text-emerald-400"
    : kycPending
      ? isDark
        ? "bg-amber-500/20 text-amber-300"
        : "bg-amber-100 text-amber-800"
      : "bg-zinc-500/20 text-zinc-500";

  return (
    <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-zinc-900/50" : "border-zinc-200 bg-zinc-50/90"}`}>
      <p className={`mb-3 text-xs font-bold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{title}</p>
      <div className="space-y-2">
        {row(pre.emailVerified, t.chkEmail)}
        {row(pre.phoneVerified, t.chkPhone)}
        <div className="flex items-center gap-2 text-sm">
          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${kycIconClass}`}>
            {kycVerified ? "✓" : kycPending ? "…" : "·"}
          </span>
          <span className={isDark ? "text-zinc-300" : "text-zinc-700"}>{kycLabel}</span>
        </div>
        {row(pre.fanVerified, t.chkFan)}
      </div>
    </div>
  );
}
