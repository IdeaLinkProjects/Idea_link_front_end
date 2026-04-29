import type { CompanyTabKey } from "@/components/profile/dashboard-company/types";

type Props = {
  isDark: boolean;
  activeTab: CompanyTabKey;
  onTabChange: (tab: CompanyTabKey) => void;
};

const tabs: Array<{ key: CompanyTabKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "team", label: "Team" },
  { key: "settings", label: "Settings" },
];

export function DashboardCompanyTabsNav({ isDark, activeTab, onTabChange }: Props) {
  return (
    <nav
      className={`sticky top-3 z-10 rounded-2xl border p-2 backdrop-blur ${
        isDark ? "border-white/15 bg-zinc-900/80 shadow-lg shadow-black/20" : "border-zinc-200 bg-white/90 shadow-md shadow-zinc-200/70"
      }`}
    >
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? isDark
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white"
                  : "bg-gradient-to-r from-primary-600 to-primary-500 text-white"
                : isDark
                  ? "text-zinc-300 hover:bg-white/10 hover:text-white"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
