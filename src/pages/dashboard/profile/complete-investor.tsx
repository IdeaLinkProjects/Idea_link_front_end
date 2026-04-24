import Head from "next/head";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CompleteInvestorProfileView } from "@/components/profile/CompleteInvestorProfileView";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function CompleteInvestorProfilePage() {
  const { locale } = useAppPreferences();
  const p = messages[locale].dashboardProfilePage;

  return (
    <>
      <Head>
        <title>{p.completeInvestorPageTitle} | IdealLink</title>
      </Head>
      <DashboardLayout>
        <CompleteInvestorProfileView />
      </DashboardLayout>
    </>
  );
}
