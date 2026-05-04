import {
  Bell,
  CreditCard,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type NotificationKind = "campaign" | "payment" | "message" | "security" | "system";

export function resolveNotificationKind(type: string): NotificationKind {
  const t = type.trim().toUpperCase();
  if (
    t.includes("CAMPAIGN") ||
    t.includes("PROJECT") ||
    t.includes("FUNDING") ||
    t.includes("EQUITY")
  ) {
    return "campaign";
  }
  if (
    t.includes("PAYMENT") ||
    t.includes("PAYOUT") ||
    t.includes("TRANSACTION") ||
    t.includes("INVOICE") ||
    t.includes("WALLET")
  ) {
    return "payment";
  }
  if (t.includes("MESSAGE") || t.includes("CHAT") || t.includes("COMMENT")) {
    return "message";
  }
  if (
    t.includes("KYC") ||
    t.includes("VERIFY") ||
    t.includes("SECURITY") ||
    t.includes("AUTH") ||
    t.includes("PASSWORD")
  ) {
    return "security";
  }
  return "system";
}

type Visual = { Icon: LucideIcon; wrapLight: string; wrapDark: string };

const MAP: Record<NotificationKind, Visual> = {
  campaign: {
    Icon: Megaphone,
    wrapLight: "bg-emerald-100 text-emerald-800 ring-emerald-200/80",
    wrapDark: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25",
  },
  payment: {
    Icon: CreditCard,
    wrapLight: "bg-amber-100 text-amber-900 ring-amber-200/80",
    wrapDark: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
  },
  message: {
    Icon: MessageCircle,
    wrapLight: "bg-sky-100 text-sky-900 ring-sky-200/80",
    wrapDark: "bg-sky-500/15 text-sky-200 ring-sky-400/25",
  },
  security: {
    Icon: ShieldCheck,
    wrapLight: "bg-violet-100 text-violet-900 ring-violet-200/80",
    wrapDark: "bg-violet-500/15 text-violet-200 ring-violet-400/25",
  },
  system: {
    Icon: Bell,
    wrapLight: "bg-primary-100 text-primary-900 ring-primary-200/80",
    wrapDark: "bg-primary-900/40 text-primary-200 ring-primary-500/20",
  },
};

export function getNotificationVisual(kind: NotificationKind, isDark: boolean): Visual & { wrap: string } {
  const v = MAP[kind];
  return { ...v, wrap: isDark ? v.wrapDark : v.wrapLight };
}
