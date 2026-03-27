import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function Button({ href, children, className }: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700",
        className,
      )}
    >
      {children}
    </Link>
  );
}
