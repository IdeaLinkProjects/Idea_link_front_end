import Head from "next/head";
import { InvestorLayout } from "@/components/investor/InvestorLayout";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function InvestorProfilePage() {
  const { locale, isDark } = useAppPreferences();

  const t = messages[locale].investorDashboard;
  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";

  return (
    <>
      <Head>
        <title>{t.profileMetaTitle}</title>
      </Head>
      <InvestorLayout>
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.profilePageTitle}</h1>
            <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.profilePageSubtitle}</p>
          </div>
          <div className={`rounded-2xl border p-8 ${cardClass}`}>
            <p className={`text-sm font-semibold ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>
              {t.userFirstName} {t.userRoleSuffix}
            </p>
            <p className={`mt-3 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.profilePlaceholder}</p>
          </div>
        </div>
      </InvestorLayout>
    </>
  );
}
