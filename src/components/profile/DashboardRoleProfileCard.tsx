import type { ReactNode } from "react";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import type { DashboardWorkspace } from "@/context/WorkspaceContext";
import {
  useGetInnovatorProfileQuery,
  useGetInvestorProfileQuery,
  type InnovatorProfileResponse,
  type InvestorProfileResponse,
} from "@/store";

type DashboardProfileMessages = (typeof messages)["en"]["dashboardProfilePage"];

type DashboardRoleProfileCardProps = {
  role: DashboardWorkspace;
  profileComplete: boolean;
  isDark: boolean;
  cardClass: string;
  t: DashboardProfileMessages;
};

function normalizeExternalUrl(raw: string | null): string | null {
  if (raw == null || !String(raw).trim()) return null;
  const trimmed = String(raw).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function ProfileCardShell({
  isLoading,
  error,
  isDark,
  cardClass,
  t,
  children,
}: {
  isLoading: boolean;
  error: unknown;
  isDark: boolean;
  cardClass: string;
  t: DashboardProfileMessages;
  children: ReactNode;
}) {
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
  return <>{children}</>;
}

export function DashboardRoleProfileCard({ role, profileComplete, isDark, cardClass, t }: DashboardRoleProfileCardProps) {
  const innovatorQuery = useGetInnovatorProfileQuery(undefined, {
    skip: role !== "innovator" || !profileComplete,
  });
  const investorQuery = useGetInvestorProfileQuery(undefined, {
    skip: role !== "investor" || !profileComplete,
  });

  if (!profileComplete) return null;

  const isInnovator = role === "innovator";
  const query = isInnovator ? innovatorQuery : investorQuery;
  const isLoading = query.isLoading || query.isFetching;
  const error = query.isError ? query.error : undefined;

  return (
    <ProfileCardShell isLoading={isLoading} error={error} isDark={isDark} cardClass={cardClass} t={t}>
      {isInnovator && innovatorQuery.data ? (
        <InnovatorProfileContent data={innovatorQuery.data} isDark={isDark} cardClass={cardClass} t={t} />
      ) : null}
      {!isInnovator && investorQuery.data ? (
        <InvestorProfileContent data={investorQuery.data} isDark={isDark} cardClass={cardClass} t={t} />
      ) : null}
    </ProfileCardShell>
  );
}


function InnovatorProfileContent({
  data,
  isDark,
  cardClass,
  t,
}: {
  data: InnovatorProfileResponse;
  isDark: boolean;
  cardClass: string;
  t: DashboardProfileMessages;
}) {
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

      <div className={`mt-6 border-t pt-6 ${isDark ? "border-white/10" : "border-zinc-200"}`}>
        <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.previousProjectsTitle}</h3>
        {data.previousProjects && data.previousProjects.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {data.previousProjects.map((project, idx) => (
              <li
                key={`${project.projectName}-${project.year}-${idx}`}
                className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-zinc-200 bg-zinc-50/80"}`}
              >
                <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{project.projectName || "—"}</p>
                <p className={`mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  <span>
                    <span className="font-medium text-zinc-500 dark:text-zinc-500">{t.previousProjectYear}:</span> {project.year ?? "—"}
                  </span>
                  <span>
                    <span className="font-medium text-zinc-500 dark:text-zinc-500">{t.previousProjectOutcome}:</span> {project.outcome || "—"}
                  </span>
                </p>
                {project.description ? (
                  <div className="mt-3">
                    <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                      {t.previousProjectDescription}
                    </p>
                    <p className={`mt-1 text-sm leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{project.description}</p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`mt-3 text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.previousProjectsEmpty}</p>
        )}
      </div>
    </div>
  );
}

function InvestorProfileContent({
  data,
  isDark,
  cardClass,
  t,
}: {
  data: InvestorProfileResponse;
  isDark: boolean;
  cardClass: string;
  t: DashboardProfileMessages;
}) {
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
