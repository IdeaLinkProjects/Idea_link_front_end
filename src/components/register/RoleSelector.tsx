import Link from "next/link";
import { Lightbulb, TrendingUp } from "lucide-react";
import { REGISTER_ROLE, type RegisterRole } from "@/lib/register/constants";
import type { RegisterPageMessages } from "@/lib/register/validateRegisterForm";

type RoleSelectorProps = {
  t: RegisterPageMessages;
  isDark: boolean;
  onSelectRole: (role: RegisterRole) => void;
};

export function RoleSelector({ t, isDark, onSelectRole }: RoleSelectorProps) {
  const card = `group flex flex-col items-center rounded-2xl border-2 p-6 text-center shadow-lg transition ${
    isDark
      ? "border-white/15 bg-white/10 hover:border-emerald-500/70 hover:bg-white/[0.12]"
      : "border-zinc-200 bg-white shadow-md hover:border-emerald-500 hover:shadow-lg"
  }`;
  const iconClass = `h-10 w-10 ${isDark ? "text-emerald-400" : "text-emerald-600"}`;
  const titleClass = `mt-3 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`;
  const descClass = `mt-2 text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`;
  const muted = isDark ? "text-zinc-400" : "text-zinc-600";
  const linkClass = `font-semibold ${isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-700 hover:text-emerald-800"}`;

  return (
    <div className="mt-8 space-y-4">
      <p className={`text-center text-sm font-medium ${muted}`}>{t.roleSectionTitle}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={() => onSelectRole(REGISTER_ROLE.INNOVATOR)} className={card}>
          <Lightbulb className={iconClass} strokeWidth={1.75} aria-hidden />
          <span className={titleClass}>{t.innovatorTitle}</span>
          <span className={descClass}>{t.innovatorDesc}</span>
        </button>
        <button type="button" onClick={() => onSelectRole(REGISTER_ROLE.INVESTOR)} className={card}>
          <TrendingUp className={iconClass} strokeWidth={1.75} aria-hidden />
          <span className={titleClass}>{t.investorTitle}</span>
          <span className={descClass}>{t.investorDesc}</span>
        </button>
      </div>
      <p className={`text-center text-sm ${muted}`}>
        {t.alreadyHave}{" "}
        <Link href="/login" className={linkClass}>
          {t.loginHere}
        </Link>
      </p>
    </div>
  );
}
