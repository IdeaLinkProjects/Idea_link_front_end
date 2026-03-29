import Head from "next/head";
import { useState } from "react";
import { InnovatorLayout } from "@/components/innovator/InnovatorLayout";
import am from "@/locales/am.json";
import en from "@/locales/en.json";

type Locale = "en" | "am";

const messages = { en, am } as const;

export default function InnovatorProfilePage() {
  const [locale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const s = window.localStorage.getItem("ideal-link-locale");
    return s === "am" || s === "en" ? s : "en";
  });
  const [theme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    const s = window.localStorage.getItem("ideal-link-theme");
    return s === "light" || s === "dark" ? s : "dark";
  });

  const t = messages[locale].innovatorDashboard;
  const isDark = theme === "dark";
  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";

  return (
    <>
      <Head>
        <title>{t.profileMetaTitle}</title>
      </Head>
      <InnovatorLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.profilePageTitle}</h1>
            <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.profilePageSubtitle}</p>
          </div>
          <div className={`rounded-2xl border p-6 ${cardClass}`}>
            <p className={`text-sm font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
              {t.userFirstName} {t.userRoleSuffix}
            </p>
            <p className={`mt-2 text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
              {locale === "am"
                ? "የመለያ ቅንብሮች እና የመገለጫ አርትዖት በቅርቡ ይገኛሉ።"
                : "Account settings and profile editing will be available in a future update."}
            </p>
          </div>
        </div>
      </InnovatorLayout>
    </>
  );
}
