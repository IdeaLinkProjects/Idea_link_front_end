import Link from "next/link";
import type { ReactNode } from "react";
import { PublicSiteHeader } from "@/components/layout/PublicSiteHeader";

type ProjectDetailShellProps = {
  isDark: boolean;
  backLabel: string;
  children: ReactNode;
};

export function ProjectDetailShell({ isDark, backLabel, children }: ProjectDetailShellProps) {
  return (
    <div className={`flex min-h-dvh flex-col ${isDark ? "bg-zinc-950 text-zinc-200" : "bg-zinc-50 text-zinc-800"}`}>
      <PublicSiteHeader backHref="/" backLabel={backLabel} />
      {children}
    </div>
  );
}

type ProjectDetailCenteredProps = {
  isDark: boolean;
  backLabel: string;
  children: ReactNode;
};

export function ProjectDetailCentered({ isDark, backLabel, children }: ProjectDetailCenteredProps) {
  return (
    <ProjectDetailShell isDark={isDark} backLabel={backLabel}>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">{children}</div>
    </ProjectDetailShell>
  );
}

type ProjectDetailNotFoundProps = {
  isDark: boolean;
  message: string;
  backLabel: string;
};

export function ProjectDetailNotFound({ isDark, message, backLabel }: ProjectDetailNotFoundProps) {
  return (
    <ProjectDetailCentered isDark={isDark} backLabel={backLabel}>
      <p>{message}</p>
      <Link href="/" className="text-primary-500 underline">
        {backLabel}
      </Link>
    </ProjectDetailCentered>
  );
}
