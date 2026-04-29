import Head from "next/head";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardCompanyView } from "@/components/profile/DashboardCompanyView";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function DashboardCompanyPage() {
  const { locale } = useAppPreferences();
  const t = messages[locale].companyPage;

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardLayout>
        <DashboardCompanyView />
      </DashboardLayout>
    </>
  );
}
