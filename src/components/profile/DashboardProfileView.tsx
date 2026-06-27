import Link from "next/link";
import { DashboardRoleProfileCard } from "@/components/profile/DashboardRoleProfileCard";
import { DashboardProfilePrereqChips } from "@/components/profile/DashboardProfilePrereqChips";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { KYC_STATUS } from "@/constants/kycStatus";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import { useGetUserRolesStatusQuery } from "@/store";

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
  const { activeWorkspace } = useWorkspace();
  const t = messages[locale].dashboardProfilePage;
  const isInnovatorWorkspace = activeWorkspace === "innovator";

  const {
    data: status,
    isLoading: statusLoading,
    isError: statusError,
    error: statusErr,
    refetch: refetchStatus,
  } = useGetUserRolesStatusQuery();

  const innovatorComplete = status?.innovatorPrerequisites?.innovatorProfileComplete === true;
  const investorComplete = status?.investorPrerequisites?.investorProfileComplete === true;
  const workspaceProfileComplete = isInnovatorWorkspace ? innovatorComplete : investorComplete;
  const workspacePrerequisites = isInnovatorWorkspace
    ? status?.innovatorPrerequisites
    : status?.investorPrerequisites;

  const displayName = status?.fullName?.trim() || "—";
  const email = status?.email?.trim() || "";
  const avatarInitials = status?.fullName ? initialsFromFullName(status.fullName) : "?";

  const cardClass = isDark
    ? "border-white/12 bg-white/[0.06] shadow-xl shadow-black/20 backdrop-blur-sm"
    : "border-zinc-200/90 bg-white shadow-lg shadow-zinc-200/50";

  const subtleCard = isDark ? "border-white/10 bg-zinc-900/40" : "border-zinc-200 bg-zinc-50/80";

  const workspaceProfileStatus = workspaceProfileComplete ? t.statusComplete : t.statusPending;
  const workspaceProfileLabel = isInnovatorWorkspace ? t.statInnovator : t.statInvestor;
  const completeProfileHref = isInnovatorWorkspace
    ? "/dashboard/profile/complete-innovator"
    : "/dashboard/profile/complete-investor";
  const completeProfileCta = isInnovatorWorkspace
    ? innovatorComplete
      ? t.editInnovatorCta
      : t.completeInnovatorCta
    : investorComplete
      ? t.editInvestorCta
      : t.completeInvestorCta;
  const completeProfileTitle = isInnovatorWorkspace ? t.innovatorProfileTitle : t.investorProfileTitle;
  const completeProfileHint = isInnovatorWorkspace ? t.completeProfileHintInnovator : t.completeProfileHintInvestor;

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

  const accountKycStatus =
    workspacePrerequisites?.kycStatus?.trim() || KYC_STATUS.NOT_SUBMITTED;

  const showProfileActionSection = true;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-4">
      <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.pageSubtitle}</p>

      {accountKycStatus === KYC_STATUS.NOT_SUBMITTED ? (
        <div
          className={`rounded-2xl border p-5 sm:p-6 ${isDark ? "border-amber-500/25 bg-amber-950/30" : "border-amber-200 bg-amber-50/90"}`}
        >
          <h2 className={`text-base font-bold ${isDark ? "text-amber-100" : "text-amber-950"}`}>{t.kycNotSubmittedTitle}</h2>
          <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-amber-200/90" : "text-amber-950/80"}`}>
            {t.kycNotSubmittedDescription}
          </p>
          <Link
            href="/kyc"
            className={`mt-4 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 ${
              isDark ? "bg-primary-600 hover:bg-primary-500" : "bg-primary-600 hover:bg-primary-700"
            }`}
          >
            {t.kycVerifyCta}
          </Link>
        </div>
      ) : null}

      {accountKycStatus === KYC_STATUS.PENDING ? (
        <div
          className={`rounded-2xl border p-5 sm:p-6 ${isDark ? "border-sky-500/20 bg-sky-950/25" : "border-sky-200 bg-sky-50/90"}`}
          role="status"
        >
          <p className={`text-sm font-medium leading-relaxed ${isDark ? "text-sky-100" : "text-sky-950"}`}>{t.kycPendingNotice}</p>
        </div>
      ) : null}

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
                {accountKycStatus === KYC_STATUS.VERIFIED ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isDark ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30" : "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200"
                    }`}
                  >
                    {t.kycVerifiedBadge}
                  </span>
                ) : null}
              </div>
              <p className={`mt-2 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{email}</p>

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
                  <div
                    className={`w-full max-w-xl rounded-xl border px-4 py-3 text-left sm:px-5 sm:py-4 ${
                      isDark ? "border-white/10 bg-black/20 text-zinc-300" : "border-zinc-200/90 bg-white/60 text-zinc-700"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{t.noRolesTitle}</p>
                    <p className={`mt-1.5 text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.noRolesDescription}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:gap-4">
            <div className={`rounded-2xl border px-3 py-4 text-center sm:px-4 ${subtleCard}`}>
              <p
                className={`text-sm font-bold ${workspaceProfileComplete ? "text-emerald-400" : isDark ? "text-zinc-400" : "text-zinc-600"}`}
              >
                {workspaceProfileStatus}
              </p>
              <p className={`mt-1 text-xs font-medium sm:text-sm ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>{workspaceProfileLabel}</p>
            </div>
          </div>
        </div>
      </section>

      {workspacePrerequisites ? (
        <DashboardProfilePrereqChips
          title={`${t.prerequisitesTitle} · ${workspaceProfileLabel}`}
          pre={workspacePrerequisites}
          t={t}
          isDark={isDark}
        />
      ) : null}

      <DashboardRoleProfileCard
        role={activeWorkspace}
        profileComplete={workspaceProfileComplete}
        isDark={isDark}
        cardClass={cardClass}
        t={t}
      />

      {showProfileActionSection ? (
        <div
          className={`rounded-2xl border p-6 sm:p-8 ${isDark ? "border-primary-500/20 bg-gradient-to-br from-primary-950/40 to-zinc-950/80" : "border-primary-200 bg-gradient-to-br from-primary-50/80 to-white"}`}
        >
          <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{completeProfileTitle}</h2>
          <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{completeProfileHint}</p>
          <div className="mt-6">
            <Link
              href={completeProfileHref}
              className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:opacity-95 ${
                isDark ? "bg-primary-600 hover:bg-primary-500" : "bg-primary-600 hover:bg-primary-700"
              }`}
            >
              {completeProfileCta}
            </Link>
          </div>
        </div>
      ) : null}

   
    </div>
  );
}
