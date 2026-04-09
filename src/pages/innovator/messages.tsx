import Head from "next/head";
import { InnovatorLayout } from "@/components/innovator/InnovatorLayout";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function InnovatorMessagesPage() {
  const { locale, isDark } = useAppPreferences();

  const t = messages[locale].innovatorDashboard;
  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";

  return (
    <>
      <Head>
        <title>{t.messagesMetaTitle}</title>
      </Head>
      <InnovatorLayout>
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.messagesPageTitle}</h1>
            <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.messagesPageSubtitle}</p>
          </div>
          <div className={`rounded-2xl border ${cardClass}`}>
            <ul className={`divide-y ${isDark ? "divide-white/10" : "divide-zinc-200"}`}>
              {t.mockMessages.map((m) => (
                <li key={m.from + m.time} className={`px-4 py-4 ${isDark ? "hover:bg-white/5" : "hover:bg-zinc-50"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{m.from}</p>
                      <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{m.preview}</p>
                    </div>
                    <span className={`shrink-0 text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{m.time}</span>
                  </div>
                  <span className="mt-2 inline-block text-sm font-semibold text-emerald-500">{t.reply}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </InnovatorLayout>
    </>
  );
}
