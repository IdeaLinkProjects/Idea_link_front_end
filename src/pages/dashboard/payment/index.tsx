import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { ChapaWalletTopUpPanel } from "@/components/wallet/components/ChapaWalletTopUpPanel";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";
import { useGetInvestorDashboardSummaryQuery } from "@/store";

export default function DashboardPaymentPage() {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].paymentPage;
  const { data: summary, refetch: refetchSummary, isFetching: loadingWallet } = useGetInvestorDashboardSummaryQuery();

  const requiredAmount = useMemo(() => {
    const raw = typeof router.query.required === "string" ? Number(router.query.required) : 0;
    return Number.isFinite(raw) && raw > 0 ? raw : 0;
  }, [router.query.required]);

  const nextPath = typeof router.query.next === "string" ? router.query.next : "/dashboard";

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
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <DashboardPageHeader title={t.title} subtitle={t.subtitle} />
          <div className={`rounded-2xl border p-8 ${cardClass}`}>
            <ChapaWalletTopUpPanel
              isDark={isDark}
              balance={summary?.walletBalance ?? 0}
              loadingWallet={loadingWallet}
              requiredAmount={requiredAmount}
              onVerified={async (res) => {
                await refetchSummary();
                if (requiredAmount > 0 && (summary?.walletBalance ?? 0) + res.amount >= requiredAmount) {
                  void router.push(nextPath);
                }
              }}
            />
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
