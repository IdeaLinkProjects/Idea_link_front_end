import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { FintechTheme } from "./theme";

type InnovatorKycAlertsProps = {
  showPending: boolean;
  showNotSubmitted: boolean;
  pendingMessage: string;
  notSubmittedMessage: string;
  actionLabel: string;
  theme: FintechTheme;
};

export function InnovatorKycAlerts({
  showPending,
  showNotSubmitted,
  pendingMessage,
  notSubmittedMessage,
  actionLabel,
  theme,
}: InnovatorKycAlertsProps) {
  const message = showPending ? pendingMessage : showNotSubmitted ? notSubmittedMessage : null;
  if (!message) return null;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${theme.alertDanger}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>{message}</span>
      </div>
      <Link href="/kyc" className={theme.link}>
        {actionLabel} →
      </Link>
    </div>
  );
}
