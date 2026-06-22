import Head from "next/head";
import Link from "next/link";
import { LandingPage } from "@/components/landing/LandingPage";
import { PublicSiteHeader } from "@/components/layout/PublicSiteHeader";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function Home() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale];
  const landing = t.landing;

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

        <footer className={`mt-auto border-t ${isDark ? "border-white/10" : "border-zinc-200"}`}>
          <div
            className={`mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-8 py-6 text-sm sm:px-12 lg:px-16 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}
          >
            <Link href="/about" className={`transition ${isDark ? "hover:text-white" : "hover:text-zinc-900"}`}>
              {t.footer.about}
            </Link>
            <Link
              href="/contact"
              className={`transition ${isDark ? "hover:text-white" : "hover:text-zinc-900"}`}
            >
              {t.footer.contact}
            </Link>
            <Link
              href="/privacy"
              className={`transition ${isDark ? "hover:text-white" : "hover:text-zinc-900"}`}
            >
              {t.footer.privacy}
            </Link>
            <Link href="/terms" className={`transition ${isDark ? "hover:text-white" : "hover:text-zinc-900"}`}>
              {t.footer.terms}
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
