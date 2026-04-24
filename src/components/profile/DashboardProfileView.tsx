import Link from "next/link";
import { DashboardProfileInnovatorCard } from "@/components/profile/DashboardProfileInnovatorCard";
import { DashboardProfileInvestorCard } from "@/components/profile/DashboardProfileInvestorCard";
import { DashboardProfilePrereqChips } from "@/components/profile/DashboardProfilePrereqChips";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import {
  useGetInnovatorProfileQuery,
  useGetInvestorProfileQuery,
  useGetUserRolesStatusQuery,
} from "@/store";

function initialsFromFullName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0];
    const b = parts[parts.length - 1][0];
    if (a && b) return (a + b).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return parts[0]?.[0]?.toUpperCase() ?? "?";
}

export function DashboardProfileView() {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].dashboardProfilePage;

  const {
    data: status,
    isLoading: statusLoading,
    isError: statusError,
    error: statusErr,
    refetch: refetchStatus,
  } = useGetUserRolesStatusQuery();

  const innovatorComplete = status?.innovatorPrerequisites?.innovatorProfileComplete === true;
  const investorComplete = status?.investorPrerequisites?.investorProfileComplete === true;

  const innovatorQuery = useGetInnovatorProfileQuery(undefined, { skip: !innovatorComplete });
  const investorQuery = useGetInvestorProfileQuery(undefined, { skip: !investorComplete });

  const displayName = status?.fullName?.trim() || "—";
  const email = status?.email?.trim() || "";
  const avatarInitials = status?.fullName ? initialsFromFullName(status.fullName) : "?";

  const cardClass = isDark
    ? "border-white/12 bg-white/[0.06] shadow-xl shadow-black/20 backdrop-blur-sm"
    : "border-zinc-200/90 bg-white shadow-lg shadow-zinc-200/50";

  const subtleCard = isDark ? "border-white/10 bg-zinc-900/40" : "border-zinc-200 bg-zinc-50/80";

  const statInnov = innovatorComplete ? t.statusComplete : t.statusPending;
  const statInv = investorComplete ? t.statusComplete : t.statusPending;

  if (statusLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 pb-4">
        <div className={`h-4 w-2/3 max-w-md rounded ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />
        <div className={`h-48 animate-pulse rounded-3xl ${isDark ? "bg-white/5" : "bg-zinc-100"}`} />
        <p className={`text-center text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.loading}</p>
      </div>
    );
  }

  if (statusError || !status) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-8 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{extractApiErrorMessage(statusErr, t.statusError)}</p>
        <button
          type="button"
          onClick={() => void refetchStatus()}
          className="mt-4 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-500"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  const showCompleteSection = !innovatorComplete || !investorComplete;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-4">
      <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.pageSubtitle}</p>

      <section className={`relative overflow-hidden rounded-3xl border ${isDark ? "border-white/10" : "border-zinc-200/80"}`}>
        <div
          className={`absolute inset-0 ${isDark ? "bg-gradient-to-br from-primary-950 via-zinc-950 to-zinc-950" : "bg-gradient-to-br from-primary-50 via-white to-zinc-50"}`}
          aria-hidden
        />
        <div className={`pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full blur-3xl ${isDark ? "bg-primary-500/25" : "bg-primary-400/30"}`} aria-hidden />
        <div className={`pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full blur-3xl ${isDark ? "bg-emerald-600/15" : "bg-emerald-400/20"}`} aria-hidden />

        <div className="relative px-6 py-10 sm:px-10 sm:py-12">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-10">
            <div className="relative shrink-0">
              <div
                className={`flex h-28 w-28 items-center justify-center rounded-3xl text-3xl font-bold tracking-tight ring-4 ${
                  isDark ? "bg-gradient-to-br from-primary-600 to-primary-800 text-white ring-white/10" : "bg-gradient-to-br from-primary-500 to-primary-700 text-white ring-primary-200/80"
                }`}
              >
                {avatarInitials}
              </div>
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-zinc-900"}`}>{displayName}</h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isDark ? "bg-white/10 text-emerald-300" : "bg-primary-100 text-primary-800"
                  }`}
                >
                  {t.memberBadge}
                </span>
              </div>
              <p className={`mt-2 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{email}</p>
              <p className={`mt-1 text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                {t.userIdLabel}: <span className="font-mono tabular-nums text-zinc-400 dark:text-zinc-400">{status.userId}</span>
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                {status.currentRoles?.length ? (
                  status.currentRoles.map((role) => (
                    <span
                      key={role}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${isDark ? "bg-white/10 text-zinc-200" : "bg-zinc-100 text-zinc-800"}`}
                    >
                      {role}
                    </span>
                  ))
                ) : (
                  <span className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.noRoles}</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
            <div className={`rounded-2xl border px-3 py-4 text-center sm:px-4 ${subtleCard}`}>
              <p className={`text-2xl font-bold tabular-nums ${isDark ? "text-white" : "text-zinc-900"}`}>{status.currentRoles?.length ?? 0}</p>
              <p className={`mt-1 text-xs font-medium sm:text-sm ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>{t.statRoles}</p>
            </div>
            <div className={`rounded-2xl border px-3 py-4 text-center sm:px-4 ${subtleCard}`}>
              <p className={`text-sm font-bold ${innovatorComplete ? "text-emerald-400" : isDark ? "text-zinc-400" : "text-zinc-600"}`}>{statInnov}</p>
              <p className={`mt-1 text-xs font-medium sm:text-sm ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>{t.statInnovator}</p>
            </div>
            <div className={`rounded-2xl border px-3 py-4 text-center sm:px-4 ${subtleCard}`}>
              <p className={`text-sm font-bold ${investorComplete ? "text-emerald-400" : isDark ? "text-zinc-400" : "text-zinc-600"}`}>{statInv}</p>
              <p className={`mt-1 text-xs font-medium sm:text-sm ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>{t.statInvestor}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardProfilePrereqChips title={`${t.prerequisitesTitle} · ${t.statInnovator}`} pre={status.innovatorPrerequisites} t={t} isDark={isDark} />
        <DashboardProfilePrereqChips title={`${t.prerequisitesTitle} · ${t.statInvestor}`} pre={status.investorPrerequisites} t={t} isDark={isDark} />
      </div>
      {(innovatorComplete || investorComplete) && (
        <div className={`grid gap-6 ${innovatorComplete && investorComplete ? "lg:grid-cols-2" : ""}`}>
          {innovatorComplete ? (
            <DashboardProfileInnovatorCard
              data={innovatorQuery.data}
              error={innovatorQuery.isError ? innovatorQuery.error : undefined}
              isLoading={innovatorQuery.isLoading || innovatorQuery.isFetching}
              isDark={isDark}
              cardClass={cardClass}
              t={t}
            />
          ) : null}
          {investorComplete ? (
            <DashboardProfileInvestorCard
              data={investorQuery.data}
              error={investorQuery.isError ? investorQuery.error : undefined}
              isLoading={investorQuery.isLoading || investorQuery.isFetching}
              isDark={isDark}
              cardClass={cardClass}
              t={t}
            />
          ) : null}
        </div>
      )}
      {showCompleteSection ? (
        <div
          className={`rounded-2xl border p-6 sm:p-8 ${isDark ? "border-primary-500/20 bg-gradient-to-br from-primary-950/40 to-zinc-950/80" : "border-primary-200 bg-gradient-to-br from-primary-50/80 to-white"}`}
        >
          <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.completeProfilesTitle}</h2>
          <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.completeProfilesHint}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {!innovatorComplete ? (
              <Link
                href="/dashboard/profile/complete-innovator"
                className={`inline-flex flex-1 items-center justify-center rounded-xl px-5 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:opacity-95 sm:flex-none ${
                  isDark ? "bg-violet-600 hover:bg-violet-500" : "bg-violet-600 hover:bg-violet-700"
                }`}
              >
                {t.completeInnovatorCta}
              </Link>
            ) : null}
            {!investorComplete ? (
              <Link
                href="/dashboard/profile/complete-investor"
                className={`inline-flex flex-1 items-center justify-center rounded-xl px-5 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:opacity-95 sm:flex-none ${
                  isDark ? "bg-amber-600 hover:bg-amber-500" : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {t.completeInvestorCta}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

   
    </div>
  );
}
