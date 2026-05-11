import Head from "next/head";
import Link from "next/link";
import { PublicSiteHeader } from "@/components/layout/PublicSiteHeader";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function PrivacyPage() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale];
  const p = t.privacyPage;

  const shell = isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900";
  const articleCard = isDark
    ? "border-white/10 bg-zinc-900/40 shadow-xl shadow-black/20 ring-1 ring-white/[0.06]"
    : "border-zinc-200/90 bg-white shadow-lg shadow-zinc-900/[0.04] ring-1 ring-primary-900/[0.04]";
  const tocLink = isDark
    ? "text-zinc-400 hover:bg-white/[0.06] hover:text-primary-200"
    : "text-zinc-600 hover:bg-primary-50/80 hover:text-primary-900";
  const h2 = isDark ? "text-white" : "text-zinc-950";
  const body = isDark ? "text-zinc-300" : "text-zinc-700";
  const muted = isDark ? "text-zinc-500" : "text-zinc-500";

  return (
    <>
      <Head>
        <title>{p.meta.title}</title>
        <meta name="description" content={p.meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={`relative flex min-h-dvh flex-col overflow-x-hidden ${shell}`}>
        <div
          className={`pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full blur-3xl ${isDark ? "bg-primary-500/20" : "bg-primary-400/20"}`}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute top-40 -right-20 h-80 w-80 rounded-full blur-3xl ${isDark ? "bg-primary-950/25" : "bg-primary-500/15"}`}
          aria-hidden
        />

        <PublicSiteHeader />

        <main className="relative z-10 mx-auto w-full max-w-screen-2xl flex-1 px-4 py-8 sm:px-5 sm:py-10 lg:px-6">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className={`text-sm font-semibold transition hover:underline ${isDark ? "text-primary-300 hover:text-primary-200" : "text-primary-700 hover:text-primary-800"}`}
            >
              ← {p.backHome}
            </Link>
            <p className={`text-xs font-medium uppercase tracking-wider ${muted}`}>{p.lastUpdated}</p>
          </div>

          <div className="lg:grid lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:items-start lg:gap-12">
            <nav
              aria-label={p.tocTitle}
              className={`mb-8 rounded-2xl border p-4 lg:sticky lg:top-28 lg:mb-0 ${articleCard}`}
            >
              <p className={`mb-3 text-xs font-bold uppercase tracking-wider ${muted}`}>{p.tocTitle}</p>
              <ol className="space-y-1 text-sm">
                {p.sections.map((section, i) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className={`block rounded-lg px-2 py-1.5 transition ${tocLink}`}>
                      <span className={`font-medium ${muted}`}>{i + 1}.</span> {section.title.replace(/^\d+\.\s*/, "")}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <article className={`rounded-3xl border p-6 sm:p-8 lg:p-10 ${articleCard}`}>
              <header className="mb-10 border-b pb-8 dark:border-white/10">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">{p.heroEyebrow}</p>
                <h1 className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${h2}`}>{p.heroTitle}</h1>
                <p className={`mt-3 text-sm ${muted}`}>{p.lastUpdated}</p>
              </header>

              <div className={`space-y-5 text-sm leading-relaxed sm:text-base ${body}`}>
                {p.intro.map((para, i) => (
                  <p key={`intro-${i}`}>{para}</p>
                ))}
              </div>

              <div className="mt-12 space-y-14">
                {p.sections.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-28">
                    <h2 className={`mb-4 text-xl font-bold tracking-tight sm:text-2xl ${h2}`}>{section.title}</h2>
                    <div className={`space-y-4 text-sm leading-relaxed sm:text-base ${body}`}>
                      {section.paragraphs.map((para, j) => (
                        <p key={`${section.id}-${j}`}>{para}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <footer className={`mt-14 border-t pt-8 text-sm italic dark:border-white/10 ${muted}`}>
                <p>{p.closingNote}</p>
              </footer>
            </article>
          </div>
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
            <Link href="/privacy" className={`font-semibold ${isDark ? "text-primary-300" : "text-primary-700"}`}>
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
