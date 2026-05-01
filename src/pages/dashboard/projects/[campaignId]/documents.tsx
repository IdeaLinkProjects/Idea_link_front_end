import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UploadCampaignDocumentView } from "@/components/profile/UploadCampaignDocumentView";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function UploadCampaignDocumentsPage() {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].uploadCampaignDocumentPage;

  const raw = router.query.campaignId;
  const campaignId = typeof raw === "string" ? parseInt(raw, 10) : NaN;
  const isValid = Number.isInteger(campaignId) && campaignId > 0;
  const isReady = router.isReady;

  const invalidLinkClass = `text-sm font-semibold ${
    isDark ? "text-primary-400 hover:text-primary-300" : "text-primary-700 hover:text-primary-800"
  }`;

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardLayout>
        {!isReady ? null : isValid ? (
          <UploadCampaignDocumentView campaignId={campaignId} />
        ) : (
          <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-zinc-200 bg-white/80 p-8 dark:border-white/10 dark:bg-zinc-900/80">
            <p className={`text-sm ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{t.invalidCampaign}</p>
            <Link href="/dashboard/projects" className={invalidLinkClass}>
              {t.backToCampaigns}
            </Link>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
