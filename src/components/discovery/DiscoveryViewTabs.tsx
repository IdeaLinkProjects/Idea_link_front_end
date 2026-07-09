import { Bookmark, LayoutGrid } from "lucide-react";
import type { DiscoveryFilterUi, DiscoveryView } from "./types";
import type { DiscoveryTheme } from "./discoveryTheme";

type DiscoveryViewTabsProps = {
  view: DiscoveryView;
  onViewChange: (view: DiscoveryView) => void;
  labels: Pick<DiscoveryFilterUi, "sidebarTitle" | "viewAll" | "viewSaved">;
  theme: DiscoveryTheme;
};

export function DiscoveryViewTabs({ view, onViewChange, labels, theme }: DiscoveryViewTabsProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 p-1.5 ${theme.viewTabList}`}
      role="tablist"
      aria-label={labels.sidebarTitle}
    >
      <button
        type="button"
        role="tab"
        aria-selected={view === "all"}
        onClick={() => onViewChange("all")}
        className={theme.viewTabClass(view === "all")}
      >
        <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
        {labels.viewAll}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "saved"}
        onClick={() => onViewChange("saved")}
        className={theme.viewTabClass(view === "saved")}
      >
        <Bookmark className="h-4 w-4 shrink-0" aria-hidden />
        {labels.viewSaved}
      </button>
    </div>
  );
}
