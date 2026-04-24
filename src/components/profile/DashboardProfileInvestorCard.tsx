import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import type { InvestorProfileResponse } from "@/store";

type DashboardProfileMessages = (typeof messages)["en"]["dashboardProfilePage"];

type DashboardProfileInvestorCardProps = {
  data: InvestorProfileResponse | undefined;
  error: unknown;
  isLoading: boolean;
  isDark: boolean;
  cardClass: string;
  t: DashboardProfileMessages;
};

export function DashboardProfileInvestorCard({ data, error, isLoading, isDark, cardClass, t }: DashboardProfileInvestorCardProps) {
  if (isLoading) {
    return (
      <div className={`animate-pulse rounded-2xl border p-6 ${cardClass}`}>
        <div className={`h-5 w-40 rounded ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />
        <div className={`mt-4 h-3 w-full rounded ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />
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

  return (
    <div className={`rounded-2xl border p-6 sm:p-7 ${cardClass}`}>
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? "bg-amber-900/50 text-amber-200" : "bg-amber-100 text-amber-900"}`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
        <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.investorProfileTitle}</h2>
      </div>
      <dl className="space-y-4">
        <div>
          <dt className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.riskTolerance}</dt>
          <dd className={`mt-1 text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{data.riskTolerance || "—"}</dd>
        </div>
        <div>
          <dt className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.maxInvestment}</dt>
          <dd className={`mt-1 text-sm tabular-nums ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{data.maxInvestmentLimit}</dd>
        </div>
        <div>
          <dt className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.investmentExperience}</dt>
          <dd className={`mt-1 text-sm ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{data.investmentExperience || "—"}</dd>
        </div>
        <div>
          <dt className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.preferredCategories}</dt>
          <dd className="mt-2 flex flex-wrap gap-2">
            {data.preferredCategories?.length ? (
              data.preferredCategories.map((c) => (
                <span
                  key={c}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${isDark ? "bg-white/10 text-zinc-200" : "bg-zinc-100 text-zinc-800"}`}
                >
                  {c}
                </span>
              ))
            ) : (
              <span className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>—</span>
            )}
          </dd>
        </div>
        <div>
          <dt className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.accreditation}</dt>
          <dd className={`mt-1 text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
            {data.accreditationVerified ? t.accreditationYes : t.accreditationNo}
          </dd>
        </div>
      </dl>
    </div>
  );
}
