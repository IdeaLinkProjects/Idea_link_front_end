import Head from "next/head";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function DashboardProfilePage() {
  const { locale, isDark } = useAppPreferences();

  const t = messages[locale].innovatorDashboard;
  const shell = messages[locale].commonDashboard;
  const iv = messages[locale].investorDashboard;
  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";

  const displayName = shell.userRoleSuffix
    ? `${shell.userFirstName} ${shell.userRoleSuffix}`.trim()
    : shell.userFirstName;

  return (
    <>
      <Head>
        <title>{t.profileMetaTitle}</title>
      </Head>
      <DashboardLayout>
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.profilePageTitle}</h1>
            <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{iv.profilePageSubtitle}</p>
          </div>
          <div className={`rounded-2xl border p-8 ${cardClass}`}>
            <p className={`text-sm font-semibold ${isDark ? "text-primary-300" : "text-primary-800"}`}>{displayName}</p>
            <p className={`mt-3 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{iv.profilePlaceholder}</p>
          </div>

          <div className={`rounded-2xl border p-5 ${cardClass}`}>
            <p className={`text-sm font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
              {messages[locale].settingsPage.subtitle}
            </p>
            <Link
              href="/dashboard/settings"
              className={`mt-3 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300`}
            >
              {shell.navSettings} →
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
