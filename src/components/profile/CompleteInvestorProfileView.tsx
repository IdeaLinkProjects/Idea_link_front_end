import Link from "next/link";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export function CompleteInvestorProfileView() {
  const { locale, isDark } = useAppPreferences();
  const p = messages[locale].dashboardProfilePage;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-1">
      <Link
        href="/dashboard/profile"
        className={`inline-flex text-sm font-semibold ${isDark ? "text-primary-400 hover:text-primary-300" : "text-primary-700 hover:text-primary-800"}`}
      >
        ← {p.backToProfile}
      </Link>
      <div
        className={`rounded-2xl border p-8 ${isDark ? "border-white/10 bg-zinc-900/50" : "border-zinc-200 bg-white shadow-sm"}`}
      >
        <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{p.completeInvestorPageTitle}</h1>
        <p className={`mt-3 text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{p.completeInvestorPageBody}</p>
      </div>
    </div>
  );
}
