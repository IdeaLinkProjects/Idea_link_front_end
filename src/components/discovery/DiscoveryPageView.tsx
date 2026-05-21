import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { HomeDiscoverySection } from "@/components/discovery/HomeDiscoverySection";
import { PublicSiteHeader } from "@/components/layout/PublicSiteHeader";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export function DiscoveryPageView() {
  const { locale, isDark } = useAppPreferences();
  const router = useRouter();
  const t = messages[locale];
  const d = t.discovery;

  const queryKeyword = typeof router.query.q === "string" ? router.query.q : "";

  return (
    <>
      <Head>
        <title>{d.meta.title}</title>
        <meta name="description" content={d.meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className={`relative flex min-h-dvh flex-col overflow-x-hidden ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}
      >
        <div
          className={`pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full blur-3xl ${isDark ? "bg-primary-500/25" : "bg-primary-400/25"}`}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute top-32 -right-24 h-96 w-96 rounded-full blur-3xl ${isDark ? "bg-primary-950/20" : "bg-primary-600/20"}`}
          aria-hidden
        />

        <PublicSiteHeader backHref="/" backLabel={t.nav.home} />

        <main className="relative z-10 mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-8 px-4 py-6 sm:px-5 sm:py-8 lg:px-6">
          <section className="relative shrink-0 overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-primary-800 via-primary-600 to-primary-700 shadow-xl shadow-primary-950/30 ring-1 ring-white/10">
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.06)_50%,transparent_60%)]"
              aria-hidden
            />
            <div className="relative flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 sm:py-8 lg:px-10">
              <div className="min-w-0 max-w-2xl">
                <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/95 backdrop-blur-sm sm:text-[11px]">
                  <span className="text-sm leading-none text-primary-100" aria-hidden>
                    ✦
                  </span>
                  {t.hero.badge}
                </p>
                <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[2.5rem]">
                  {d.heading}
                </h1>
              </div>
              <p className="max-w-full text-sm leading-relaxed text-white/90 sm:max-w-md sm:text-right sm:text-base lg:max-w-lg">
                {d.meta.description}
              </p>
            </div>
          </section>

          <HomeDiscoverySection initialKeyword={queryKeyword} />
        </main>

        <footer className={`mt-auto border-t ${isDark ? "border-white/10" : "border-zinc-200"}`}>
          <div
            className={`mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-6 text-sm sm:px-5 lg:px-6 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}
          >
            <Link href="/about" className={`transition ${isDark ? "hover:text-white" : "hover:text-zinc-900"}`}>
              {t.footer.about}
            </Link>
            <Link href="/contact" className={`transition ${isDark ? "hover:text-white" : "hover:text-zinc-900"}`}>
              {t.footer.contact}
            </Link>
            <Link href="/privacy" className={`transition ${isDark ? "hover:text-white" : "hover:text-zinc-900"}`}>
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
