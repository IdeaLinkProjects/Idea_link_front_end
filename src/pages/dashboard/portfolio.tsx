import Head from "next/head";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardProjectsView } from "@/components/profile/DashboardProjectsView";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function InvestorCampaignsPage() {
  const { locale } = useAppPreferences();
  const t = messages[locale].investorDashboard;

  return (
    <>
      <Head>
        <title>{t.portfolioMetaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardLayout>
        <DashboardProjectsView mode="investor" />
      </DashboardLayout>
    </>
  );
}
