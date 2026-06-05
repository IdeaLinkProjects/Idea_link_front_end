import Head from "next/head";
import { useRouter } from "next/router";
import { InvestStepAmount } from "@/components/projects/invest/InvestStepAmount";
import { InvestStepReview } from "@/components/projects/invest/InvestStepReview";
import { InvestSuccess } from "@/components/projects/invest/InvestSuccess";
import { useProjectInvestFlow } from "@/components/projects/invest/useProjectInvestFlow";
import { ProjectDetailNotFound, ProjectDetailShell } from "@/components/projects/project-detail/ProjectDetailShell";
import { useProjectDetailPageData } from "@/components/projects/project-detail/useProjectDetailPageData";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { hasStoredAuthTokens } from "@/lib/auth/tokenStorage";
import { messages } from "@/locales";
import { useEffect } from "react";

export default function ProjectInvestPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";

  const { locale, isDark } = useAppPreferences();
  const t = messages[locale];
  const inv = t.investmentFlow;
  const p = t.projectDetail;

  const { campaignIdNum, apiCampaign, apiLoading, apiError, idea, bundle, pct } = useProjectDetailPageData(
    id,
    locale,
    t.discovery,
    p,
  );

  const flow = useProjectInvestFlow(campaignIdNum, id, locale);

  const remaining = Math.max(0, bundle.goalEtb - bundle.raisedEtb);

  useEffect(() => {
    if (!router.isReady) return;
    if (!hasStoredAuthTokens()) {
      void router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
    }
  }, [router]);

  if (!router.isReady) {
    return null;
  }

  if (campaignIdNum != null && apiLoading && !apiCampaign) {
    return (
      <ProjectDetailShell isDark={isDark} backLabel={t.nav.home}>
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

  const viewProps = { isDark, locale, inv, idea, bundle, pct };

  return (
    <>
      <Head>
        <title>
          {inv.metaTitle} — {idea.name}
        </title>
      </Head>
      <ProjectDetailShell isDark={isDark} backLabel={t.nav.home}>
        <main className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-10">
          {flow.step === "success" ? (
            <InvestSuccess
              {...viewProps}
              numberOfShares={flow.numberOfShares}
              notes={flow.notes}
              reference={flow.reference}
            />
          ) : null}

          {flow.step === 1 ? (
            <InvestStepAmount
              {...viewProps}
              numberOfShares={flow.numberOfShares}
              onNumberOfSharesChange={flow.setNumberOfShares}
              step1ErrorShares={flow.step1ErrorShares}
              remaining={remaining}
              onReview={flow.goReview}
            />
          ) : null}

          {flow.step === 2 ? (
            <InvestStepReview
              {...viewProps}
              numberOfShares={flow.numberOfShares}
              confirmDateLabel={flow.confirmDateLabel}
              notes={flow.notes}
              onNotesChange={flow.setNotes}
              chkDisclosed={flow.chkDisclosed}
              onChkDisclosedChange={flow.setChkDisclosed}
              chkSimulated={flow.chkSimulated}
              onChkSimulatedChange={flow.setChkSimulated}
              chkReturns={flow.chkReturns}
              onChkReturnsChange={flow.setChkReturns}
              step2Attempted={flow.step2Attempted}
              acknowledgementsValid={flow.acknowledgementsValid}
              submitError={flow.submitError}
              isSubmitting={flow.isSubmittingInvestment}
              onConfirm={flow.goConfirm}
              onBack={flow.goBackToAmount}
            />
          ) : null}
        </main>
      </ProjectDetailShell>
    </>
  );
}
