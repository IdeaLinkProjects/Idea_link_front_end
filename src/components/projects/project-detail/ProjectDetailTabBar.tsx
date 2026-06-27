import type { messages } from "@/locales";
import type { ProjectDetailTabKey } from "./types";
import { projectDetailTabClass, projectDetailTabListClass } from "./projectDetailClassNames";

type ProjectDetailCopy = (typeof messages.en)["projectDetail"];

type ProjectDetailTabBarProps = {
  isDark: boolean;
  p: ProjectDetailCopy;
  tab: ProjectDetailTabKey;
  onTabChange: (tab: ProjectDetailTabKey) => void;
};

export function ProjectDetailTabBar({ isDark, p, tab, onTabChange }: ProjectDetailTabBarProps) {
  return (
    <div className="mt-2 sm:mt-4">
      <p className={`mb-3 text-xs font-bold uppercase tracking-widest ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>Contents</p>
      <div
        className={`flex flex-wrap gap-1.5 ${projectDetailTabListClass(isDark)}`}
        role="tablist"
        aria-label="Project sections"
      >
        {(
          [
            ["overview", p.tabs.overview],
            ["risks", p.tabs.risks],
            ["updates", p.tabs.updates],
            ["comments", p.tabs.comments],
            ["documents", p.tabs.documents],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={projectDetailTabClass(isDark, key, tab)}
            onClick={() => onTabChange(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
