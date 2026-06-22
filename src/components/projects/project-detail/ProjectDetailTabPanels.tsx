import type { ReactNode } from "react";
import type { PublicProjectBundle } from "@/lib/campaign/fromMyCampaign";
import type { Locale, messages } from "@/locales";
import type { ProjectDetailTabKey } from "./types";
import { ProjectCommentsPanel } from "./ProjectCommentsPanel";
import { ProjectUpdatesPanel } from "./ProjectUpdatesPanel";
import { projectDetailCardClass, projectDetailMutedClass, projectDetailSectionTitleClass } from "./projectDetailClassNames";

type ProjectDetailCopy = (typeof messages.en)["projectDetail"];

type ProjectDetailTabPanelsProps = {
  isDark: boolean;
  locale: Locale;
  p: ProjectDetailCopy;
  bundle: PublicProjectBundle;
  tab: ProjectDetailTabKey;
  campaignId: number | null;
  isLoggedIn: boolean;
  onDocPreview: () => void;
};

function SectionCard({
  isDark,
  children,
  accent = "primary",
}: {
  isDark: boolean;
  children: ReactNode;
  accent?: "primary" | "amber" | "emerald";
}) {
  const card = projectDetailCardClass(isDark);
  const border =
    accent === "amber"
      ? isDark
        ? "border-l-amber-500/70"
        : "border-l-amber-500"
      : accent === "emerald"
        ? isDark
          ? "border-l-emerald-500/70"
          : "border-l-emerald-600"
        : isDark
          ? "border-l-primary-400/80"
          : "border-l-primary-600";
  return <div className={`rounded-2xl border-l-4 ${border} p-5 sm:p-6 ${card}`}>{children}</div>;
}

export function ProjectDetailTabPanels({ isDark, locale, p, bundle, tab, campaignId, isLoggedIn, onDocPreview }: ProjectDetailTabPanelsProps) {
  const muted = projectDetailMutedClass(isDark);
  const title = projectDetailSectionTitleClass(isDark);

  if (tab === "overview") {
    return (
      <div className="mt-8 space-y-6 sm:space-y-8">
        <SectionCard isDark={isDark}>
          <h2 className={title}>{p.overview.problemTitle}</h2>
          <p className={`mt-4 text-base leading-relaxed sm:text-[1.05rem] ${muted}`}>{bundle.problem}</p>
        </SectionCard>
        <SectionCard isDark={isDark} accent="emerald">
          <h2 className={title}>{p.overview.solutionTitle}</h2>
          <p className={`mt-4 text-base leading-relaxed sm:text-[1.05rem] ${muted}`}>{bundle.solution}</p>
        </SectionCard>
        <SectionCard isDark={isDark}>
          <h2 className={title}>{p.aboutCampaignTitle}</h2>
          {bundle.storySections.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {bundle.storySections.map((section, i) => (
                <li key={`${section.title}-${i}`} className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-zinc-50/60"}`}>
                  <h3 className={`text-base font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{section.title}</h3>
                  <p className={`mt-2 text-base leading-relaxed ${muted}`}>{section.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`mt-4 whitespace-pre-line text-base leading-relaxed sm:text-[1.05rem] ${muted}`}>{bundle.problem}</p>
          )}
        </SectionCard>
        <SectionCard isDark={isDark}>
          <h2 className={title}>{p.companyTitle}</h2>
          {bundle.companyProfile ? (
            <div className={`mt-4 rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-zinc-50/60"}`}>
              <div className="flex items-center gap-3">
                {bundle.companyProfile.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- company logo URL comes from API
                  <img src={bundle.companyProfile.logoUrl} alt={bundle.companyProfile.name} className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xs font-bold ${isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-200 text-zinc-700"}`}>
                    {bundle.companyProfile.name.slice(0, 2).toUpperCase() || "—"}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className={`truncate text-base font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{bundle.companyProfile.name}</h3>
                  <p className={`truncate text-sm ${muted}`}>{bundle.companyProfile.industry || "—"}</p>
                </div>
              </div>
              <p className={`mt-3 text-sm leading-relaxed ${muted}`}>{bundle.companyProfile.description || "—"}</p>
              {bundle.companyProfile.website ? (
                <a
                  href={bundle.companyProfile.website}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-3 inline-flex text-sm font-semibold ${isDark ? "text-primary-300 hover:text-primary-200" : "text-primary-700 hover:text-primary-800"}`}
                >
                  {bundle.companyProfile.website}
                </a>
              ) : null}
            </div>
          ) : (
            <p className={`mt-4 text-base leading-relaxed ${muted}`}>{bundle.team}</p>
          )}
        </SectionCard>
      </div>
    );
  }

  if (tab === "risks") {
    return (
      <div className="mt-8 space-y-6">
        <SectionCard isDark={isDark} accent="amber">
          <h2 className={title}>{p.risks.disclosureTitle}</h2>
          {bundle.riskSections.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {bundle.riskSections.map((risk, i) => (
                <li key={`${risk.title}-${i}`} className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-zinc-50/60"}`}>
                  <h3 className={`text-base font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{risk.title}</h3>
                  <p className={`mt-2 text-base leading-relaxed ${muted}`}>{risk.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`mt-4 text-base leading-relaxed sm:text-[1.05rem] ${muted}`}>{bundle.risksDisclosure}</p>
          )}
        </SectionCard>
      </div>
    );
  }

  if (tab === "updates") {
    if (campaignId != null) {
      return <ProjectUpdatesPanel campaignId={campaignId} locale={locale} isDark={isDark} t={p.updates} />;
    }

    return (
      <ul className="mt-8 space-y-5">
        {bundle.updates.map((u, i) => (
          <li key={i} className={`rounded-2xl border p-5 sm:p-6 ${projectDetailCardClass(isDark)}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-primary-500">{u.date}</p>
            <h3 className={`mt-2 text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>{u.title}</h3>
            <p className={`mt-3 text-base leading-relaxed ${muted}`}>{u.body}</p>
          </li>
        ))}
      </ul>
    );
  }

  if (tab === "comments") {
    if (campaignId != null) {
      return <ProjectCommentsPanel campaignId={campaignId} locale={locale} isDark={isDark} isLoggedIn={isLoggedIn} t={p.comments} />;
    }

    return (
      <p className={`mt-8 rounded-2xl border border-dashed px-4 py-10 text-center text-sm ${muted} ${projectDetailCardClass(isDark)}`}>
        {p.comments.emptyList}
      </p>
    );
  }

  if (tab === "documents") {
    return (
      <ul className="mt-8 space-y-4">
        {bundle.documents.length === 0 ? (
          <li className={`rounded-2xl border p-8 text-center text-sm sm:text-base ${muted} ${projectDetailCardClass(isDark)}`}>
            {p.docDemoNote}
          </li>
        ) : (
          bundle.documents.map((doc, i) => (
            <li
              key={i}
              className={`flex flex-col gap-4 rounded-2xl border p-4 transition hover:border-primary-500/30 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${projectDetailCardClass(
                isDark,
              )}`}
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                    isDark ? "bg-primary-950/50 text-primary-200" : "bg-primary-50 text-primary-800"
                  }`}
                  aria-hidden
                >
                  ⧉
                </span>
                <div className="min-w-0">
                  <p className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{doc.name}</p>
                  <p className={`mt-0.5 text-xs font-medium uppercase tracking-wide ${muted}`}>
                    {doc.kind} · {doc.sizeLabel}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2 sm:pl-2">
                <button
                  type="button"
                  onClick={onDocPreview}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    isDark ? "border-white/20 hover:bg-white/10" : "border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {p.preview}
                </button>
                <button
                  type="button"
                  onClick={onDocPreview}
                  className="rounded-xl bg-gradient-to-r from-primary-950 to-primary-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-primary-900 hover:to-primary-600"
                >
                  {p.download}
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    );
  }

  return null;
}
