import type { CompanyTabKey } from "@/components/profile/dashboard-company/types";

type Props = {
  activeTab: CompanyTabKey;
  onTabChange: (tab: CompanyTabKey) => void;
};

const tabs: Array<{ key: CompanyTabKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "team", label: "Team" },
  { key: "settings", label: "Settings" },
];

export function DashboardCompanyTabsNav({ activeTab, onTabChange }: Props) {
  return (
    <nav
      className="sticky top-3 z-10 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-md shadow-slate-200/70 backdrop-blur dark:border-white/15 dark:bg-zinc-900/80 dark:shadow-lg dark:shadow-black/20"
    >
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-sm dark:from-primary-500 dark:to-primary-600"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
