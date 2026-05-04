import type { ReactNode } from "react";
import type { PublicProjectBundle } from "@/lib/campaign/fromMyCampaign";
import type { messages } from "@/locales";
import type { ProjectDetailTabKey } from "./types";
import { projectDetailCardClass, projectDetailMutedClass, projectDetailSectionTitleClass } from "./projectDetailClassNames";

type ProjectDetailCopy = (typeof messages.en)["projectDetail"];

type ProjectDetailTabPanelsProps = {
  isDark: boolean;
  p: ProjectDetailCopy;
  bundle: PublicProjectBundle;
  tab: ProjectDetailTabKey;
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

export function ProjectDetailTabPanels({ isDark, p, bundle, tab, onDocPreview }: ProjectDetailTabPanelsProps) {
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
          <h2 className={title}>{p.overview.teamTitle}</h2>
          <p className={`mt-4 whitespace-pre-line text-base leading-relaxed sm:text-[1.05rem] ${muted}`}>{bundle.team}</p>
        </SectionCard>
        <SectionCard isDark={isDark}>
          <h2 className={title}>{p.overview.timelineTitle}</h2>
          <ol className="mt-5 space-y-4">
            {bundle.timeline.map((row, i) => (
              <li key={i} className="flex gap-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ${
                    row.done
                      ? "bg-gradient-to-br from-primary-700 to-primary-950 text-white"
                      : isDark
                        ? "border border-white/10 bg-zinc-800 text-zinc-300"
                        : "border border-zinc-200 bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {row.done ? "✓" : i + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className={`text-base font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{row.milestone}</p>
                  <p className={`mt-0.5 text-sm ${muted}`}>{row.date}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>
        <SectionCard isDark={isDark} accent="emerald">
          <h2 className={title}>{p.overview.fundsTitle}</h2>
          <ul className="mt-5 space-y-4">
            {bundle.funds.map((f, i) => (
              <li key={i}>
                <div className="flex justify-between text-sm font-semibold sm:text-base">
                  <span className={isDark ? "text-zinc-200" : "text-zinc-800"}>{f.label}</span>
                  <span className="tabular-nums text-primary-600 dark:text-primary-300">{f.percent}%</span>
                </div>
                <div className={`mt-2 h-2.5 overflow-hidden rounded-full ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-800 to-primary-500"
                    style={{ width: `${f.percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    );
  }

  if (tab === "risks") {
    return (
      <div className="mt-8 space-y-6">
        <SectionCard isDark={isDark} accent="amber">
          <h2 className={title}>{p.risks.disclosureTitle}</h2>
          <p className={`mt-4 text-base leading-relaxed sm:text-[1.05rem] ${muted}`}>{bundle.risksDisclosure}</p>
        </SectionCard>
        <SectionCard isDark={isDark}>
          <h2 className={title}>{p.risks.levelTitle}</h2>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-primary-500 sm:text-4xl">{bundle.riskLevel}</p>
          <p className={`mt-3 text-base leading-relaxed ${muted}`}>{bundle.riskLevelExplanation}</p>
        </SectionCard>
        <SectionCard isDark={isDark}>
          <h2 className={title}>{p.risks.considerationsTitle}</h2>
          <p className={`mt-4 text-base leading-relaxed sm:text-[1.05rem] ${muted}`}>{bundle.investorConsiderations}</p>
        </SectionCard>
      </div>
    );
  }

  if (tab === "updates") {
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
