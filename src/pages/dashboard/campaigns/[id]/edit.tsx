import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CampaignEditView } from "@/components/profile/CampaignEditView";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function EditCampaignPage() {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const tEdit = messages[locale].campaignEditPage;
  const td = messages[locale].campaignDetailPage;

  const rawId = router.query.id;
  const campaignId = typeof rawId === "string" ? Number(rawId) : NaN;
  const isValid = Number.isInteger(campaignId) && campaignId > 0;

  return (
    <>
      <Head>
        <title>{tEdit.metaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardLayout>
        {!router.isReady ? null : !isValid ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white/80 p-6 dark:border-white/10 dark:bg-zinc-900/80">
            <p className={`text-sm ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{td.invalidCampaign}</p>
            <Link href="/dashboard/projects" className={`mt-3 inline-flex text-sm font-semibold ${isDark ? "text-primary-300" : "text-primary-700"}`}>
              {td.backToCampaigns}
            </Link>
          </div>
        ) : (
          <CampaignEditView campaignId={campaignId} />
        )}
      </DashboardLayout>
    </>
  );
}
