import Link from "next/link";
import type { RegisterPageMessages } from "@/lib/register/validateRegisterForm";

type SuccessMessageProps = {
  t: RegisterPageMessages;
  isDark: boolean;
  signInLabel: string;
};

export function SuccessMessage({ t, isDark, signInLabel }: SuccessMessageProps) {
  return (
    <div
      className={`mt-8 rounded-2xl border p-8 text-center ${isDark ? "border-white/15 bg-white/10 shadow-lg shadow-black/30 backdrop-blur-md" : "border-zinc-200 bg-white shadow-xl shadow-zinc-300/50"}`}
    >
      <p className={`text-lg font-semibold ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>{t.successTitle}</p>
      <p className={`mt-2 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{t.successBody}</p>
      <Link
        href="/login"
        className="mt-6 inline-flex rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-600"
      >
        {signInLabel}
      </Link>
    </div>
  );
}
