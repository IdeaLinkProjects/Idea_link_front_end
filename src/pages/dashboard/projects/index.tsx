import Head from "next/head";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardProjectsView } from "@/components/profile/DashboardProjectsView";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function DashboardProjectsPage() {
  const { locale } = useAppPreferences();
  const t = messages[locale].innovatorDashboard;

  return (
    <>
      <Head>
        <title>{t.projectsMetaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardLayout>
        <DashboardProjectsView mode="creator" />
      </DashboardLayout>
    </>
  );
}
