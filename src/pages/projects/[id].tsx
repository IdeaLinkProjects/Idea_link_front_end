import Head from "next/head";
import { useRouter } from "next/router";
import { PublicSiteHeader } from "@/components/layout/PublicSiteHeader";
import { ProjectDetailAside } from "@/components/projects/project-detail/ProjectDetailAside";
import { ProjectDetailNotFound, ProjectDetailShell } from "@/components/projects/project-detail/ProjectDetailShell";
import { ProjectDetailTabBar } from "@/components/projects/project-detail/ProjectDetailTabBar";
import { ProjectDetailTabPanels } from "@/components/projects/project-detail/ProjectDetailTabPanels";
import { ProjectDetailToast } from "@/components/projects/project-detail/ProjectDetailToast";
import { ProjectHeroSection } from "@/components/projects/project-detail/ProjectHeroSection";
import type { ProjectDetailTabKey } from "@/components/projects/project-detail/types";
import { useProjectDetailPageData } from "@/components/projects/project-detail/useProjectDetailPageData";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { messages } from "@/locales";

export default function ProjectDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";
  const from = typeof router.query.from === "string" ? router.query.from : "";

  const { locale, isDark } = useAppPreferences();
  const t = messages[locale];
  const d = t.discovery;
  const p = t.projectDetail;

  const { campaignIdNum, apiCampaign, apiLoading, apiError, idea, bundle, catLabel, pct, similarIdeas } = useProjectDetailPageData(
    id,
    locale,
    d,
    p,
  );

  const [tab, setTab] = useState<ProjectDetailTabKey>("overview");
  const [calcAmount, setCalcAmount] = useState(5000);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (bundle.minInvestmentEtb > 0) {
      setCalcAmount((prev) => (prev < bundle.minInvestmentEtb ? bundle.minInvestmentEtb : prev));
    }
  }, [bundle.minInvestmentEtb]);

  const equityPreview = useMemo(() => {
    if (bundle.goalEtb <= 0) return 0;
    const raw = (calcAmount / bundle.goalEtb) * bundle.equityOfferedPct;
    return Math.min(bundle.equityOfferedPct, Math.max(0, raw));
  }, [calcAmount, bundle.goalEtb, bundle.equityOfferedPct]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2600);
  }, []);

  const onDocPreview = useCallback(() => {
    showToast(p.docDemoNote);
  }, [p.docDemoNote, showToast]);

  const showInvestAction = from !== "investments";

  if (!router.isReady) {
    return null;
  }

  if (campaignIdNum != null && apiLoading && !apiCampaign) {
    return (
      <ProjectDetailShell isDark={isDark} backLabel={p.backDiscovery}>
        <div className="flex flex-1 items-center justify-center px-4">
          <p className="text-sm font-medium">…</p>
        </div>
      </ProjectDetailShell>
    );
  }

  if (campaignIdNum != null && !apiLoading && !apiCampaign && apiError) {
    return <ProjectDetailNotFound isDark={isDark} message={p.notFound} backLabel={p.backDiscovery} />;
  }

  if (!idea) {
    return <ProjectDetailNotFound isDark={isDark} message={p.notFound} backLabel={p.backDiscovery} />;
  }

  return (
    <>
      <Head>
        <title>
          {idea.name} | {t.brand.ideal}
          {t.brand.link}
        </title>
        <meta name="description" content={idea.description} />
      </Head>
      <div className={`relative min-h-dvh overflow-x-hidden ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
        <div
          className={`pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full blur-3xl ${isDark ? "bg-primary-600/15" : "bg-primary-400/20"}`}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute -right-16 top-[28rem] h-80 w-80 rounded-full blur-3xl ${isDark ? "bg-emerald-600/10" : "bg-emerald-400/15"}`}
          aria-hidden
        />

        <PublicSiteHeader backHref="/" backLabel={p.backDiscovery} />

        <section className="relative z-10 w-full py-6 sm:py-8">
          <ProjectHeroSection
            isDark={isDark}
            locale={locale}
            p={p}
            idea={idea}
            bundle={bundle}
            catLabel={catLabel}
            pct={pct}
            investHref={`/projects/${id}/invest`}
            showInvestAction={showInvestAction}
          />
        </section>

        <main className="relative z-10 mx-auto max-w-6xl px-4 pb-8 sm:px-6 sm:pb-10 lg:pb-12">
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 xl:grid-cols-[1fr_360px]">
            <div className="min-w-0">
              <ProjectDetailTabBar isDark={isDark} p={p} tab={tab} onTabChange={setTab} />
              <ProjectDetailTabPanels
                isDark={isDark}
                locale={locale}
                p={p}
                bundle={bundle}
                tab={tab}
                campaignId={campaignIdNum}
                onDocPreview={onDocPreview}
              />
            </div>
            <ProjectDetailAside
              isDark={isDark}
              p={p}
              bundle={bundle}
              similarIdeas={similarIdeas}
              calcAmount={calcAmount}
              onCalcAmountChange={setCalcAmount}
              equityPreview={equityPreview}
            />
          </div>
        </main>

        <ProjectDetailToast message={toast} />
      </div>
    </>
  );
}
