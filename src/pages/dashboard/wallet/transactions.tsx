import Head from "next/head";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function WalletTransactionHistoryPage() {
  const { locale } = useAppPreferences();
  const t = messages[locale].walletPage;

  return (
    <>
      <Head>
        <title>{t.transactions.metaTitle}</title>
      </Head>
      <DashboardLayout>
        <div className="mx-auto w-full max-w-5xl">
          <DashboardPageHeader title={t.transactions.title} subtitle={t.transactions.subtitle} />
          <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{t.transactions.comingSoon}</h2>
            <p className="mt-2 text-sm text-slate-600">{t.transactions.description}</p>
          </section>
        </div>
      </DashboardLayout>
    </>
  );
}
