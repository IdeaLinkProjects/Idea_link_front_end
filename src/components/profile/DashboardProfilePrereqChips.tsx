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

  return (
    <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-zinc-900/50" : "border-zinc-200 bg-zinc-50/90"}`}>
      <p className={`mb-3 text-xs font-bold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{title}</p>
      <div className="space-y-2">
        {row(pre.emailVerified, t.chkEmail)}
        {row(pre.phoneVerified, t.chkPhone)}
        {row(pre.kycVerified, t.chkKyc)}
        {row(pre.fanVerified, t.chkFan)}
      </div>
    </div>
  );
}
