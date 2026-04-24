import Head from "next/head";
import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

/** Client-only: avoids Turbopack SSR chunk error ("CJS module can't be async") with RTK Query on this route. */
const DashboardProfileView = dynamic(
  () => import("@/components/profile/DashboardProfileView").then((m) => m.DashboardProfileView),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-4xl space-y-6 px-1 py-4">
        <div className="h-4 w-2/3 max-w-sm animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-52 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
        <p className="text-center text-sm text-zinc-500">Loading…</p>
      </div>
    ),
  },
);

export default function DashboardProfilePage() {
  const { locale } = useAppPreferences();
  const p = messages[locale].dashboardProfilePage;

  return (
    <>
      <Head>
        <title>{p.metaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardLayout>
        <DashboardProfileView />
      </DashboardLayout>
    </>
  );
}
