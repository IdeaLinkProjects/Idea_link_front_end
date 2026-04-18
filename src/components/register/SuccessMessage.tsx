import Link from "next/link";
import type { RegisterPageMessages } from "@/lib/register/validateRegisterForm";

type SuccessMessageProps = {
  t: RegisterPageMessages;
  signInLabel: string;
};

export function SuccessMessage({ t, signInLabel }: SuccessMessageProps) {
  return (
    <div className="mt-3 flex flex-col rounded-xl border border-zinc-200 bg-white p-4 text-center text-sm shadow-xl shadow-zinc-300/50 dark:border-white/15 dark:bg-white/10 dark:shadow-black/30 lg:items-start lg:text-left">
      <p className="font-semibold text-primary-800 dark:text-primary-300">{t.successTitle}</p>
      <p className="mt-1.5 text-xs leading-snug text-zinc-600 dark:text-zinc-400">{t.successBody}</p>
      <Link
        href="/login"
        className="mt-4 inline-flex rounded-lg bg-primary-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-950/40 transition hover:bg-primary-900 lg:self-start"
      >
        {signInLabel}
      </Link>
    </div>
  );
}
