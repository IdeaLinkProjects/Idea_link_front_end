import clsx from "clsx";
import type { ReactNode } from "react";
import type { LandingTheme } from "./types";

type LandingSectionProps = {
  theme: LandingTheme;
  id?: string;
  className?: string;
  children: ReactNode;
};

export function LandingSection({ theme, id, className, children }: LandingSectionProps) {
  return (
    <section id={id} className={clsx(theme.sectionX, className)}>
      {children}
    </section>
  );
}
