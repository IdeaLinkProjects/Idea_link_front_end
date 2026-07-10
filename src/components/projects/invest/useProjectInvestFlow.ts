import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import type { Locale } from "@/locales";
import { useInvestInCampaignMutation } from "@/store";
import { useEffect, useMemo, useState } from "react";

export type InvestStep = 1 | 2 | "success";

export function useProjectInvestFlow(campaignIdNum: number | null, routeId: string, locale: Locale) {
  const [step, setStep] = useState<InvestStep>(1);
  const [numberOfShares, setNumberOfShares] = useState(100);
  const [chkDisclosed, setChkDisclosed] = useState(false);
  const [step1Attempted, setStep1Attempted] = useState(false);
  const [step2Attempted, setStep2Attempted] = useState(false);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [investInCampaign, { isLoading: isSubmittingInvestment }] = useInvestInCampaignMutation();

  useEffect(() => {
    setStep(1);
    setChkDisclosed(false);
    setStep1Attempted(false);
    setStep2Attempted(false);
    setReference("");
    setNotes("");
    setSubmitError("");
    setNumberOfShares(100);
  }, [routeId]);

  const sharesValid = Number.isInteger(numberOfShares) && numberOfShares > 0;
  const step1ErrorShares = step1Attempted && !sharesValid;
  const acknowledgementsValid = chkDisclosed;

  const confirmDateLabel = useMemo(() => {
    return new Intl.DateTimeFormat(locale === "am" ? "am-ET" : "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, [locale]);

  const goReview = () => {
    setStep1Attempted(true);
    if (!sharesValid) return;
    setStep(2);
    setStep2Attempted(false);
  };

  const goBackToAmount = () => {
    setStep(1);
    setStep2Attempted(false);
  };

  const submitInvestment = async () => {
    if (campaignIdNum == null || !sharesValid) return;
    setSubmitError("");
    const sanitizedShares = Number.isFinite(numberOfShares) ? Math.max(1, Math.round(numberOfShares)) : 1;
    try {
      const res = await investInCampaign({
        campaignId: campaignIdNum,
        payload: { numberOfShares: sanitizedShares, notes: notes.trim() },
      }).unwrap();
      setReference(
        res.transactionReference ??
          `IL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      );
      setStep("success");
    } catch (err) {
      setSubmitError(extractApiErrorMessage(err, "Unable to complete investment. Please try again."));
    }
  };

  const goConfirm = () => {
    setStep2Attempted(true);
    if (!acknowledgementsValid) return;
    void submitInvestment();
  };

  return {
    step,
    numberOfShares,
    setNumberOfShares,
    chkDisclosed,
    setChkDisclosed,
    step1ErrorShares,
    step2Attempted,
    acknowledgementsValid,
    reference,
    notes,
    setNotes,
    submitError,
    isSubmittingInvestment,
    confirmDateLabel,
    goReview,
    goBackToAmount,
    goConfirm,
  };
}
