import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";
import { useMemo } from "react";
import { DiscoveryCampaignResults } from "./DiscoveryCampaignResults";
import { DiscoveryFilterSidebar } from "./DiscoveryFilterSidebar";
import { DiscoveryViewTabs } from "./DiscoveryViewTabs";
import { getDiscoveryTheme } from "./discoveryTheme";
import { useDiscoverySection } from "./useDiscoverySection";

export type HomeDiscoverySectionProps = {
  /** Pre-fill search from landing hero or `?q=` URL param */
  initialKeyword?: string;
};

export function HomeDiscoverySection({ initialKeyword = "" }: HomeDiscoverySectionProps) {
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale];
  const copy = t.discovery;
  const filterUi = copy.filterUi;

  const discovery = useDiscoverySection(initialKeyword);
  const theme = useMemo(() => getDiscoveryTheme(isDark), [isDark]);

  const saveLabels = useMemo(
    () => ({ save: filterUi.save, saved: filterUi.saved, loginToSave: filterUi.loginToSave }),
    [filterUi.save, filterUi.saved, filterUi.loginToSave],
  );

  return (
    <div className="flex flex-col gap-6">
      <DiscoveryViewTabs
        view={discovery.view}
        onViewChange={discovery.setView}
        labels={filterUi}
        theme={theme}
      />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        {discovery.view === "all" ? (
          <DiscoveryFilterSidebar
            filterForm={discovery.filterForm}
            onKeywordChange={(keyword) => discovery.patchFilterForm({ keyword })}
            onToggleStatus={discovery.toggleStatus}
            onToggleTag={discovery.toggleTag}
            onPatchForm={discovery.patchFilterForm}
            onReset={discovery.resetFilters}
            copy={copy}
            filterUi={filterUi}
            theme={theme}
            isDark={isDark}
          />
        ) : null}

        <DiscoveryCampaignResults
          view={discovery.view}
          isSavedView={discovery.isSavedView}
          isLoggedIn={discovery.isLoggedIn}
          campaigns={discovery.campaigns}
          totalElements={discovery.totalElements}
          totalPages={discovery.totalPages}
          page={discovery.page}
          onPageChange={discovery.setPage}
          isLoading={discovery.isLoading}
          isFetching={discovery.isFetching}
          isError={discovery.isError}
          error={discovery.error}
          onRetry={() => void discovery.refetch()}
          locale={locale}
          isDark={isDark}
          copy={copy}
          filterUi={filterUi}
          featured={t.featured}
          saveLabels={saveLabels}
          theme={theme}
        />
      </div>
    </div>
  );
}
