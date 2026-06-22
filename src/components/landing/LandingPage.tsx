import clsx from "clsx";
import { LandingHeroSection } from "./sections/LandingHeroSection";
import { LandingStatsSection } from "./sections/LandingStatsSection";
import { LandingLiveCampaignsSection } from "./sections/LandingLiveCampaignsSection";
import { LandingTransparencySection } from "./sections/LandingTransparencySection";
import { LandingHowItWorksSection } from "./sections/LandingHowItWorksSection";
import { LandingSectorsSection } from "./sections/LandingSectorsSection";
import { LandingPathsSection } from "./sections/LandingPathsSection";
import { LandingTestimonialSection } from "./sections/LandingTestimonialSection";
import { LandingFaqSection } from "./sections/LandingFaqSection";
import { LandingFinalCtaSection } from "./sections/LandingFinalCtaSection";
import { useLandingPage } from "./useLandingPage";

export function LandingPage() {
  const {
    locale,
    t,
    theme,
    query,
    setQuery,
    openFaq,
    setOpenFaq,
    liveLoading,
    campaigns,
    stats,
    goToDiscovery,
    onSubmitSearch,
  } = useLandingPage();

  const handlePopularTagClick = (tag: string) => {
    setQuery(tag);
    goToDiscovery(tag);
  };

  const handleToggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className={clsx("flex flex-col", theme.section)}>
      <LandingHeroSection
        t={t}
        theme={theme}
        query={query}
        onQueryChange={setQuery}
        onSubmitSearch={onSubmitSearch}
        onPopularTagClick={handlePopularTagClick}
      />
      <LandingStatsSection t={t} theme={theme} stats={stats} />
      <LandingLiveCampaignsSection
        locale={locale}
        t={t}
        theme={theme}
        campaigns={campaigns}
        isLoading={liveLoading}
      />
      <LandingTransparencySection t={t} theme={theme} />
      <LandingHowItWorksSection t={t} theme={theme} />
      <LandingSectorsSection t={t} theme={theme} onSectorClick={goToDiscovery} />
      <LandingPathsSection t={t} theme={theme} />
      <LandingTestimonialSection t={t} theme={theme} />
      <LandingFaqSection t={t} theme={theme} openFaq={openFaq} onToggleFaq={handleToggleFaq} />
      <LandingFinalCtaSection t={t} theme={theme} />
    </div>
  );
}
