import Head from "next/head";
import { LandingPage } from "@/components/landing/LandingPage";
import { PublicSiteFooter } from "@/components/layout/PublicSiteFooter";
import { PublicSiteHeader } from "@/components/layout/PublicSiteHeader";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function Home() {
  const { locale, isDark } = useAppPreferences();
  const landing = messages[locale].landing;

  return (
    <>
      <Head>
        <title>{landing.meta.title}</title>
        <meta name="description" content={landing.meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className={`relative flex min-h-dvh flex-col overflow-x-hidden ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-[#f7faf8] text-zinc-900"}`}
      >
        <PublicSiteHeader />

        <LandingPage />

        <PublicSiteFooter />
      </div>
    </>
  );
}
