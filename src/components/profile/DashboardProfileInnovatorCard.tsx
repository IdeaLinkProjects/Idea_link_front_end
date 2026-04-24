import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import type { InnovatorProfileResponse } from "@/store";

type DashboardProfileMessages = (typeof messages)["en"]["dashboardProfilePage"];

type DashboardProfileInnovatorCardProps = {
  data: InnovatorProfileResponse | undefined;
  error: unknown;
  isLoading: boolean;
  isDark: boolean;
  cardClass: string;
  t: DashboardProfileMessages;
};

function normalizeExternalUrl(raw: string | null): string | null {
  if (raw == null || !String(raw).trim()) return null;
  const t = String(raw).trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function DashboardProfileInnovatorCard({ data, error, isLoading, isDark, cardClass, t }: DashboardProfileInnovatorCardProps) {
  if (isLoading) {
    return (
      <div className={`animate-pulse rounded-2xl border p-6 ${cardClass}`}>
        <div className={`h-5 w-40 rounded ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />
        <div className={`mt-4 h-3 w-full rounded ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />
        <div className={`mt-2 h-3 w-11/12 max-w-md rounded ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />
      </div>
    );
  }
  if (error) {
    return (
      <div className={`rounded-2xl border border-red-500/30 bg-red-500/5 p-6 ${cardClass}`}>
        <p className="text-sm text-red-600 dark:text-red-400">{extractApiErrorMessage(error, t.profileFetchError)}</p>
      </div>
    );
  }
  if (!data) return null;

  const li = normalizeExternalUrl(data.linkedinUrl);
  const web = normalizeExternalUrl(data.websiteUrl);

  return (
    <div className={`rounded-2xl border p-6 sm:p-7 ${cardClass}`}>
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? "bg-violet-900/50 text-violet-300" : "bg-violet-100 text-violet-800"}`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </span>
        <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.innovatorProfileTitle}</h2>
      </div>
      <dl className="space-y-4">
        <div>
          <dt className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.bio}</dt>
          <dd className={`mt-1 text-sm leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{data.bio || "—"}</dd>
        </div>
        <div>
          <dt className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.companyRole}</dt>
          <dd className={`mt-1 text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{data.companyRole || "—"}</dd>
        </div>
        <div>
          <dt className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.experienceYears}</dt>
          <dd className={`mt-1 text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
            {data.experienceYears != null ? `${data.experienceYears} ${t.yearsSuffix}` : "—"}
          </dd>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <dt className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.linkedin}</dt>
            <dd className="mt-1">
              {li ? (
                <a href={li} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400">
                  {li}
                </a>
              ) : (
                <span className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.website}</dt>
            <dd className="mt-1">
              {web ? (
                <a href={web} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400">
                  {web}
                </a>
              ) : (
                <span className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>—</span>
              )}
            </dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
