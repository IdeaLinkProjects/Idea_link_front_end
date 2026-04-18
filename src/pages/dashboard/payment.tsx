import Head from "next/head";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function DashboardPaymentPage() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].paymentPage;

  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardLayout>
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.title}</h1>
            <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.subtitle}</p>
          </div>
          <div className={`rounded-2xl border p-8 ${cardClass}`}>
            <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.placeholder}</p>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
