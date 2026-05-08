import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CampaignDetailView } from "@/components/profile/CampaignDetailView";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function CampaignDetailPage() {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].campaignDetailPage;

  const rawId = router.query.id;
  const campaignId = typeof rawId === "string" ? Number(rawId) : NaN;
  const isValid = Number.isInteger(campaignId) && campaignId > 0;
  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardLayout>
        {!router.isReady ? null : isValid ? (
          <CampaignDetailView campaignId={campaignId} />
        ) : (
          <div className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white/80 p-6 dark:border-white/10 dark:bg-zinc-900/80">
            <p className={`text-sm ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{t.invalidCampaign}</p>
            <Link
              href="/dashboard/projects"
              className={`mt-3 inline-flex text-sm font-semibold ${
                isDark ? "text-primary-300 hover:text-primary-200" : "text-primary-700 hover:text-primary-800"
              }`}
            >
              {t.backToCampaigns}
            </Link>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}

