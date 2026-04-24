import Head from "next/head";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CompleteInnovatorProfileView } from "@/components/profile/CompleteInnovatorProfileView";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function CompleteInnovatorProfilePage() {
  const { locale } = useAppPreferences();
  const p = messages[locale].dashboardProfilePage;

  return (
    <>
      <Head>
        <title>{p.completeInnovatorPageTitle} | IdealLink</title>
      </Head>
      <DashboardLayout>
        <CompleteInnovatorProfileView />
      </DashboardLayout>
    </>
  );
}
