import { useRouter } from "next/router";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { hasStoredAuthTokens } from "@/lib/auth/tokenStorage";
import { useSaveCampaignMutation, useUnsaveCampaignMutation } from "@/store";

export type SaveCampaignButtonProps = {
  campaignId: number;
  isSaved: boolean;
  labels: {
    save: string;
    saved: string;
    loginToSave: string;
  };
  isDark: boolean;
  size?: "sm" | "md";
  className?: string;
};

export function SaveCampaignButton({
  campaignId,
  isSaved,
  labels,
  isDark,
  size = "md",
  className = "",
}: SaveCampaignButtonProps) {
  const router = useRouter();
  const [saveCampaign, saveState] = useSaveCampaignMutation();
  const [unsaveCampaign, unsaveState] = useUnsaveCampaignMutation();
  const [optimisticSaved, setOptimisticSaved] = useState(isSaved);

  useEffect(() => {
    setOptimisticSaved(isSaved);
  }, [isSaved]);

  const isLoading = saveState.isLoading || unsaveState.isLoading;

  const handleClick = useCallback(
  async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hasStoredAuthTokens()) {
      void router.push(`/login?from=${encodeURIComponent(router.asPath)}`);
      return;
    }

    const nextSaved = !optimisticSaved;
    setOptimisticSaved(nextSaved);

    try {
      if (nextSaved) {
        await saveCampaign(campaignId).unwrap();
      } else {
        await unsaveCampaign(campaignId).unwrap();
      }
    } catch {
      setOptimisticSaved(!nextSaved);
    }
  },
  [campaignId, optimisticSaved, router, saveCampaign, unsaveCampaign],
);

  const iconSize = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";
  const btnSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const tooltip = !hasStoredAuthTokens() ? labels.loginToSave : optimisticSaved ? labels.saved : labels.save;

  return (
    <button
      type="button"
      onClick={(e) => void handleClick(e)}
      disabled={isLoading}
      title={tooltip}
      aria-label={tooltip}
      className={`group/save relative inline-flex shrink-0 items-center justify-center rounded-full transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 disabled:cursor-wait ${btnSize} ${
        optimisticSaved
          ? isDark
            ? "bg-primary-500/20 text-primary-300 ring-1 ring-primary-400/40 hover:bg-primary-500/30"
            : "bg-primary-50 text-primary-700 ring-1 ring-primary-200 hover:bg-primary-100"
          : isDark
            ? "bg-white/[0.06] text-zinc-300 ring-1 ring-white/10 hover:bg-white/[0.12] hover:text-white"
            : "bg-zinc-100/90 text-zinc-600 ring-1 ring-zinc-200/80 hover:bg-zinc-200/80 hover:text-zinc-900"
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className={`${iconSize} animate-spin`} aria-hidden />
      ) : optimisticSaved ? (
        <BookmarkCheck className={`${iconSize} fill-current`} aria-hidden />
      ) : (
        <Bookmark className={iconSize} aria-hidden />
      )}
      <span
        className={`pointer-events-none absolute -bottom-9 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-medium shadow-lg group-hover/save:block ${
          isDark ? "bg-zinc-800 text-zinc-100 ring-1 ring-white/10" : "bg-zinc-900 text-white"
        }`}
        role="tooltip"
      >
        {tooltip}
      </span>
    </button>
  );
}
