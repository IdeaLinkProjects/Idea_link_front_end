import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import am from "@/locales/am.json";
import en from "@/locales/en.json";

type Locale = "en" | "am";

const messages = { en, am } as const;

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [locale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const s = window.localStorage.getItem("ideal-link-locale");
    return s === "am" || s === "en" ? s : "en";
  });

  const [theme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    const s = window.localStorage.getItem("ideal-link-theme");
    return s === "light" || s === "dark" ? s : "dark";
  });

  const t = messages[locale].loginPage;
  const isDark = theme === "dark";

  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("ideal-link-remember-email") ?? "";
  });
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!emailOk(email)) e.email = t.errors.email;
    if (!password) e.password = t.errors.password;
    return e;
  }, [email, password, t]);

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    if (remember && typeof window !== "undefined") {
      window.localStorage.setItem("ideal-link-remember-email", email.trim());
    } else {
      window.localStorage.removeItem("ideal-link-remember-email");
    }
    const emailLower = email.trim().toLowerCase();
    const storedRole = typeof window !== "undefined" ? window.localStorage.getItem("ideal-link-demo-role") : null;
    const goInvestor =
      storedRole === "investor" || emailLower.startsWith("investor@") || emailLower.includes("+investor@");
    void router.push(goInvestor ? "/investor" : "/innovator");
  };

  const inputBase = isDark
    ? "bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500"
    : "bg-white text-zinc-900 placeholder:text-zinc-400";

  const fieldBorder = (key: string, valid: boolean) => {
    if (submitted && errors[key]) return "border-red-500 ring-2 ring-red-500/20";
    if (submitted && valid && !errors[key]) return "border-emerald-500 ring-1 ring-emerald-500/30";
    return isDark
      ? "border-white/20 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
      : "border-zinc-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
  };

  const labelClass = isDark ? "text-zinc-300" : "text-zinc-700";
  const iconMuted = isDark ? "text-zinc-500" : "text-zinc-400";
  const linkAccent = isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-700 hover:text-emerald-800";
  const subtleText = isDark ? "text-zinc-400" : "text-zinc-600";
  const divider = isDark ? "border-white/10" : "border-zinc-100";

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className={`relative min-h-screen overflow-hidden ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}
      >
        <div
          className={`pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full blur-3xl ${isDark ? "bg-emerald-500/25" : "bg-emerald-400/25"}`}
        />
        <div
          className={`pointer-events-none absolute top-32 -right-20 h-80 w-80 rounded-full blur-3xl ${isDark ? "bg-emerald-700/20" : "bg-emerald-600/20"}`}
        />

        <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6">
          <div className="text-center">
            <Link href="/" className="text-2xl font-extrabold tracking-tight">
              <span className="text-emerald-500">Ideal</span>
              <span className="text-emerald-300">Link</span>
            </Link>
          </div>

          <div
            className={`mt-6 w-full rounded-2xl border p-6 backdrop-blur-md sm:p-8 ${isDark ? "border-white/15 bg-white/10 shadow-lg shadow-black/30" : "border-zinc-200 bg-white shadow-xl shadow-zinc-300/50"}`}
          >
            <h1 className={`text-center text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
              {t.title}
            </h1>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <div>
                <label htmlFor="login-email" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                  {t.email}
                </label>
                <div className="relative">
                  <MailIcon className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${iconMuted}`} />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition ${inputBase} ${fieldBorder("email", emailOk(email))}`}
                  />
                </div>
                {submitted && errors.email ? <p className="mt-1.5 text-sm text-red-400">{errors.email}</p> : null}
              </div>

              <div>
                <label htmlFor="login-password" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                  {t.password}
                </label>
                <div className="relative">
                  <LockIcon className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${iconMuted}`} />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className={`w-full rounded-xl border py-3 pl-11 pr-12 text-sm outline-none transition ${inputBase} ${fieldBorder("password", password.length > 0)}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className={`absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition ${isDark ? "text-zinc-400 hover:bg-white/10 hover:text-zinc-200" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"}`}
                    aria-label={showPassword ? t.hidePassword : t.showPassword}
                  >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {submitted && errors.password ? <p className="mt-1.5 text-sm text-red-400">{errors.password}</p> : null}
              </div>

              <label className={`flex cursor-pointer items-center gap-2 ${subtleText}`}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-500 bg-transparent text-emerald-600 focus:ring-emerald-600"
                />
                <span className="text-sm">{t.rememberMe}</span>
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-700 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-600"
              >
                {t.signIn}
              </button>

              <div className="text-center">
                <Link href="/forgot-password" className={`text-sm font-medium ${linkAccent}`}>
                  {t.forgotPassword}
                </Link>
              </div>

              <p className={`border-t pt-6 text-center text-sm ${divider} ${subtleText}`}>
                {t.noAccount}{" "}
                <Link href="/register" className={`font-semibold ${linkAccent}`}>
                  {t.registerHere}
                </Link>
              </p>
              <p className={`text-center text-sm ${subtleText}`}>
                <Link href="/investor" className={`font-semibold ${linkAccent}`}>
                  {t.investorHome}
                </Link>
              </p>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
