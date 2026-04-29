import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import type { MyCompanyResponse } from "@/store";

type DashboardProfileMessages = (typeof messages)["en"]["dashboardProfilePage"];

type DashboardProfileCompanyCardProps = {
  data: MyCompanyResponse | undefined;
  error: unknown;
  isLoading: boolean;
  isDark: boolean;
  cardClass: string;
  t: DashboardProfileMessages;
};

function normalizeExternalUrl(raw: string | null | undefined): string | null {
  if (raw == null || !String(raw).trim()) return null;
  const value = String(raw).trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function formatCompactCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function DashboardProfileCompanyCard({ data, error, isLoading, isDark, cardClass, t }: DashboardProfileCompanyCardProps) {
  if (isLoading) {
    return (
      <div className={`animate-pulse rounded-3xl border p-6 sm:p-8 ${cardClass}`}>
        <div className={`h-6 w-56 rounded ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />
        <div className={`mt-4 h-3 w-full rounded ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />
        <div className={`mt-2 h-3 w-11/12 rounded ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className={`h-20 rounded-2xl ${isDark ? "bg-white/10" : "bg-zinc-200/80"}`} />
          ))}
        </div>
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

  const founderName = data.founder?.fullName?.trim() || "—";
  const website = normalizeExternalUrl(data.website);
  const campaignStats = data.campaignStats;
  const successRate = campaignStats?.successRate != null ? `${Math.round(campaignStats.successRate * 100)}%` : "—";
  const teamMembers = [...(data.teamMembers ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
  const recentCampaigns = data.recentCampaigns ?? [];

  return (
    <section className={`relative overflow-hidden rounded-3xl border ${cardClass}`}>
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-gradient-to-br from-emerald-950/50 via-zinc-950 to-zinc-950"
            : "bg-gradient-to-br from-emerald-50 via-white to-slate-50"
        }`}
        aria-hidden
      />
      <div className={`pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full blur-3xl ${isDark ? "bg-primary-600/20" : "bg-primary-300/30"}`} aria-hidden />

      <div className="relative p-6 sm:p-8">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  isDark ? "bg-emerald-900/60 text-emerald-300 ring-1 ring-emerald-500/30" : "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7l8-4 6 3v15M9 9h.01M9 13h.01M9 17h.01M13 9h.01M13 13h.01M13 17h.01" />
                </svg>
              </span>
              <div className="min-w-0">
                <h2 className={`truncate text-xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{data.name || "—"}</h2>
                <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{data.industry || "—"}</p>
              </div>
            </div>
            <p className={`mt-3 text-sm ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{data.description || "—"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                data.verified
                  ? isDark
                    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                    : "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
                  : isDark
                    ? "bg-zinc-700/60 text-zinc-300"
                    : "bg-zinc-200 text-zinc-700"
              }`}
            >
              {data.verified ? t.companyVerified : t.companyUnverified}
            </span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isDark ? "bg-white/10 text-zinc-300" : "bg-zinc-100 text-zinc-700"}`}>
              {t.companyRegistered}: {data.isRegisteredCompany ? t.companyYes : t.companyNo}
            </span>
            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition ${
                  isDark ? "bg-primary-500/15 text-primary-300 hover:bg-primary-500/25" : "bg-primary-100 text-primary-700 hover:bg-primary-200"
                }`}
              >
                {t.website}
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-300 bg-white/90 shadow-sm shadow-slate-200/40"}`}>
            <p className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.companyStage}</p>
            <p className={`mt-1 text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{data.stage || "—"}</p>
          </div>
          <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-300 bg-white/90 shadow-sm shadow-slate-200/40"}`}>
            <p className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.companySize}</p>
            <p className={`mt-1 text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{data.companiesize || "—"}</p>
          </div>
          <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-300 bg-white/90 shadow-sm shadow-slate-200/40"}`}>
            <p className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.companyFounder}</p>
            <p className={`mt-1 text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{founderName}</p>
          </div>
          <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-slate-300 bg-white/90 shadow-sm shadow-slate-200/40"}`}>
            <p className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.companyHeadquarters}</p>
            <p className={`mt-1 text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{data.headquarters || "—"}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`rounded-2xl border p-4 ${isDark ? "border-primary-500/20 bg-primary-900/20" : "border-primary-300 bg-primary-50/80"}`}>
            <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.companyTotalCampaigns}</p>
            <p className={`mt-1 text-xl font-bold tabular-nums ${isDark ? "text-white" : "text-zinc-900"}`}>{campaignStats?.totalCampaigns ?? 0}</p>
          </div>
          <div className={`rounded-2xl border p-4 ${isDark ? "border-primary-500/20 bg-primary-900/20" : "border-primary-300 bg-primary-50/80"}`}>
            <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.companySuccessRate}</p>
            <p className={`mt-1 text-xl font-bold tabular-nums ${isDark ? "text-white" : "text-zinc-900"}`}>{successRate}</p>
          </div>
          <div className={`rounded-2xl border p-4 ${isDark ? "border-primary-500/20 bg-primary-900/20" : "border-primary-300 bg-primary-50/80"}`}>
            <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.companyTotalRaised}</p>
            <p className={`mt-1 text-xl font-bold tabular-nums ${isDark ? "text-white" : "text-zinc-900"}`}>{formatCompactCurrency(campaignStats?.totalRaised)}</p>
          </div>
          <div className={`rounded-2xl border p-4 ${isDark ? "border-primary-500/20 bg-primary-900/20" : "border-primary-300 bg-primary-50/80"}`}>
            <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.companyTeamMembers}</p>
            <p className={`mt-1 text-xl font-bold tabular-nums ${isDark ? "text-white" : "text-zinc-900"}`}>{teamMembers.length}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-300 bg-white/95 shadow-sm shadow-slate-200/40"}`}>
            <h3 className={`text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>Team</h3>
            <div className="mt-3 space-y-3">
              {teamMembers.length ? (
                teamMembers.slice(0, 4).map((member) => (
                  <div key={member.id} className={`rounded-xl border p-3 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-300 bg-slate-50/90"}`}>
                    <p className={`text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{member.fullName}</p>
                    <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{member.role || "—"}</p>
                  </div>
                ))
              ) : (
                <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>No team members yet.</p>
              )}
            </div>
          </div>

          <div className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-300 bg-white/95 shadow-sm shadow-slate-200/40"}`}>
            <h3 className={`text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>Recent campaigns</h3>
            <div className="mt-3 space-y-3">
              {recentCampaigns.length ? (
                recentCampaigns.slice(0, 3).map((campaign) => (
                  <div key={campaign.id} className={`rounded-xl border p-3 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-300 bg-slate-50/90"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{campaign.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${isDark ? "bg-white/10 text-zinc-300" : "bg-zinc-200 text-zinc-700"}`}>{campaign.status}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>{Math.round(campaign.fundingProgress ?? 0)}%</span>
                      <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>{formatCompactCurrency(campaign.amountRaised)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>No campaigns yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className={`mt-4 text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
          Founded {data.foundedYear || "—"} · Updated {formatDate(data.updatedAt)}
        </div>
      </div>
    </section>
  );
}
