import Head from "next/head";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { InnovatorDashboardView } from "@/components/dashboard/InnovatorDashboardView";
import { InvestorDashboardView } from "@/components/dashboard/InvestorDashboardView";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { messages } from "@/locales";

export default function DashboardHomePage() {
  const { locale } = useAppPreferences();
  const { activeWorkspace } = useWorkspace();
  const shell = messages[locale].commonDashboard;

  return (
    <>
      <Head>
        <title>{shell.homeMetaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardLayout>
        <div className="mx-auto max-w-6xl">
          <div key={activeWorkspace} className="animate-workspace-content">
            {activeWorkspace === "innovator" ? <InnovatorDashboardView /> : <InvestorDashboardView />}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
