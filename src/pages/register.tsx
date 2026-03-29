import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FormEvent, useMemo, useState } from "react";
import am from "@/locales/am.json";
import en from "@/locales/en.json";

type Locale = "en" | "am";
type Role = "innovator" | "investor";

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

export default function RegisterPage() {
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

  const t = messages[locale].registerPage;
  const isDark = theme === "dark";

  const urlRole = useMemo(() => {
    if (!router.isReady) return null;
    const r = router.query.role;
    return r === "innovator" || r === "investor" ? r : null;
  }, [router.isReady, router.query.role]);

  const [pickedRole, setPickedRole] = useState<Role | null>(null);
  const [ignoreUrlRole, setIgnoreUrlRole] = useState(false);
  const role = ignoreUrlRole ? pickedRole : pickedRole ?? urlRole;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [horizon, setHorizon] = useState("");
  const [tolerance, setTolerance] = useState("");
  const [priorInvest, setPriorInvest] = useState("");
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!emailOk(email)) e.email = t.errors.email;
    if (password.length < 8) e.password = t.errors.password;
    if (!fullName.trim()) e.fullName = t.errors.fullName;
    if (!nationalId.trim()) e.nationalId = t.errors.nationalId;
    if (!terms) e.terms = t.errors.terms;
    if (role === "innovator") {
      if (!licenseFile) e.license = t.errors.license;
      else if (licenseFile.size > 10 * 1024 * 1024) e.license = t.errors.licenseSize;
    }
    if (role === "investor") {
      if (!horizon || !tolerance || !priorInvest) e.risk = t.errors.risk;
    }
    return e;
  }, [email, password, fullName, nationalId, terms, role, licenseFile, horizon, tolerance, priorInvest, t]);

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    if (typeof window !== "undefined" && role) {
      window.localStorage.setItem("ideal-link-demo-role", role);
    }
    setSuccess(true);
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
  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/30 backdrop-blur-md"
    : "border-zinc-200 bg-white shadow-xl shadow-zinc-300/50";
  const roleCardClass = isDark
    ? "border-2 border-white/15 bg-white/10 shadow-lg transition hover:border-emerald-500/70 hover:bg-white/[0.12]"
    : "border-2 border-zinc-200 bg-white shadow-md transition hover:border-emerald-500 hover:shadow-lg";

  const radioLabelClass = isDark
    ? "border-white/15 bg-zinc-950/40 text-zinc-200 has-[:checked]:border-emerald-500 has-[:checked]:ring-1 has-[:checked]:ring-emerald-500/40"
    : "border-zinc-200 bg-white text-zinc-800 has-[:checked]:border-emerald-600 has-[:checked]:ring-1 has-[:checked]:ring-emerald-600/30";

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
          className={`pointer-events-none absolute top-40 -right-20 h-80 w-80 rounded-full blur-3xl ${isDark ? "bg-emerald-700/20" : "bg-emerald-600/20"}`}
        />

        <main className="relative z-10 mx-auto min-h-screen w-full max-w-2xl px-4 py-10 pb-16 sm:px-6">
          <div className="text-center">
            <Link href="/" className="text-2xl font-extrabold tracking-tight">
              <span className="text-emerald-500">Ideal</span>
              <span className="text-emerald-300">Link</span>
            </Link>
          </div>

          <h1 className={`mt-4 text-center text-2xl font-bold tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-zinc-900"}`}>
            {t.title}
          </h1>

          {success ? (
            <div className={`mt-8 rounded-2xl border p-8 text-center ${cardClass}`}>
              <p className={`text-lg font-semibold ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>{t.successTitle}</p>
              <p className={`mt-2 text-sm ${subtleText}`}>{t.successBody}</p>
              <Link
                href="/login"
                className="mt-6 inline-flex rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-600"
              >
                {messages[locale].loginPage.signIn}
              </Link>
            </div>
          ) : !role ? (
            <div className="mt-8 space-y-4">
              <p className={`text-center text-sm font-medium ${subtleText}`}>{t.roleSectionTitle}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setPickedRole("innovator");
                    setIgnoreUrlRole(true);
                  }}
                  className={`group flex flex-col items-center rounded-2xl p-6 text-center ${roleCardClass}`}
                >
                  <span className="text-4xl" aria-hidden>
                    💡
                  </span>
                  <span className={`mt-3 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.innovatorTitle}</span>
                  <span className={`mt-2 text-sm leading-relaxed ${subtleText}`}>{t.innovatorDesc}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPickedRole("investor");
                    setIgnoreUrlRole(true);
                  }}
                  className={`group flex flex-col items-center rounded-2xl p-6 text-center ${roleCardClass}`}
                >
                  <span className="text-4xl" aria-hidden>
                    📈
                  </span>
                  <span className={`mt-3 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{t.investorTitle}</span>
                  <span className={`mt-2 text-sm leading-relaxed ${subtleText}`}>{t.investorDesc}</span>
                </button>
              </div>
              <p className={`text-center text-sm ${subtleText}`}>
                {t.alreadyHave}{" "}
                <Link href="/login" className={`font-semibold ${linkAccent}`}>
                  {t.loginHere}
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={`mt-8 space-y-5 rounded-2xl border p-6 sm:p-8 ${cardClass}`} noValidate>
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-semibold ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>
                  {role === "innovator" ? t.innovatorTitle : t.investorTitle}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPickedRole(null);
                    setIgnoreUrlRole(true);
                    setSubmitted(false);
                    setLicenseFile(null);
                  }}
                  className={`text-sm font-medium underline-offset-2 ${isDark ? "text-zinc-400 hover:text-emerald-300" : "text-zinc-600 hover:text-emerald-700"} hover:underline`}
                >
                  {t.changeRole}
                </button>
              </div>

              <div>
                <label htmlFor="reg-email" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                  {t.email}
                </label>
                <div className="relative">
                  <MailIcon className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${iconMuted}`} />
                  <input
                    id="reg-email"
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
                <label htmlFor="reg-password" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                  {t.password}
                </label>
                <div className="relative">
                  <LockIcon className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${iconMuted}`} />
                  <input
                    id="reg-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition ${inputBase} ${fieldBorder("password", password.length >= 8)}`}
                  />
                </div>
                {submitted && errors.password ? <p className="mt-1.5 text-sm text-red-400">{errors.password}</p> : null}
              </div>

              <div>
                <label htmlFor="reg-name" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                  {t.fullName}
                </label>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${inputBase} ${fieldBorder("fullName", fullName.trim().length > 0)}`}
                />
                {submitted && errors.fullName ? <p className="mt-1.5 text-sm text-red-400">{errors.fullName}</p> : null}
              </div>

              <div>
                <label htmlFor="reg-nid" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                  {t.nationalId}
                </label>
                <input
                  id="reg-nid"
                  type="text"
                  autoComplete="off"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder={t.nationalIdPlaceholder}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${inputBase} ${fieldBorder("nationalId", nationalId.trim().length > 0)}`}
                />
                {submitted && errors.nationalId ? <p className="mt-1.5 text-sm text-red-400">{errors.nationalId}</p> : null}
              </div>

              {role === "innovator" ? (
                <div>
                  <label htmlFor="reg-license" className={`mb-1.5 block text-sm font-medium ${labelClass}`}>
                    {t.businessLicense}
                  </label>
                  <input
                    id="reg-license"
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)}
                    className={`block w-full cursor-pointer rounded-xl border border-dashed px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white ${isDark ? "border-white/25 bg-zinc-950/40 text-zinc-300 file:hover:bg-emerald-600 hover:bg-white/5" : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100"} ${submitted && errors.license ? "border-red-500 ring-2 ring-red-500/20" : ""}`}
                  />
                  <p className={`mt-1 text-xs ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{t.uploadHint}</p>
                  {licenseFile ? (
                    <p className={`mt-1 text-xs font-medium ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>{licenseFile.name}</p>
                  ) : null}
                  {submitted && errors.license ? <p className="mt-1.5 text-sm text-red-400">{errors.license}</p> : null}
                </div>
              ) : (
                <fieldset
                  className={`space-y-4 rounded-xl border p-4 ${submitted && errors.risk ? "border-red-500 bg-red-500/10" : isDark ? "border-white/15 bg-zinc-950/30" : "border-zinc-200 bg-zinc-50/80"}`}
                >
                  <legend className={`px-1 text-sm font-semibold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                    {t.riskSectionTitle}
                  </legend>

                  <div>
                    <p className={`mb-2 text-sm font-medium ${labelClass}`}>{t.riskQ1}</p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      {[
                        { v: "short", label: t.riskQ1o1 },
                        { v: "medium", label: t.riskQ1o2 },
                        { v: "long", label: t.riskQ1o3 },
                      ].map((o) => (
                        <label key={o.v} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${radioLabelClass}`}>
                          <input type="radio" name="horizon" value={o.v} checked={horizon === o.v} onChange={() => setHorizon(o.v)} />
                          {o.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className={`mb-2 text-sm font-medium ${labelClass}`}>{t.riskQ2}</p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      {[
                        { v: "conservative", label: t.riskQ2o1 },
                        { v: "moderate", label: t.riskQ2o2 },
                        { v: "aggressive", label: t.riskQ2o3 },
                      ].map((o) => (
                        <label key={o.v} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${radioLabelClass}`}>
                          <input type="radio" name="tolerance" value={o.v} checked={tolerance === o.v} onChange={() => setTolerance(o.v)} />
                          {o.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className={`mb-2 text-sm font-medium ${labelClass}`}>{t.riskQ3}</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { v: "yes", label: t.riskQ3o1 },
                        { v: "no", label: t.riskQ3o2 },
                      ].map((o) => (
                        <label key={o.v} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${radioLabelClass}`}>
                          <input type="radio" name="prior" value={o.v} checked={priorInvest === o.v} onChange={() => setPriorInvest(o.v)} />
                          {o.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  {submitted && errors.risk ? <p className="text-sm text-red-400">{errors.risk}</p> : null}
                </fieldset>
              )}

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${isDark ? "border-white/15 bg-white/5" : "border-zinc-200 bg-zinc-50/80"}`}
              >
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-500 bg-transparent text-emerald-600 focus:ring-emerald-600"
                />
                <span className={`text-sm ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{t.terms}</span>
              </label>
              {submitted && errors.terms ? <p className="text-sm text-red-400">{errors.terms}</p> : null}

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-700 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-600"
              >
                {t.createAccount}
              </button>

              <p className={`text-center text-sm ${subtleText}`}>
                {t.alreadyHave}{" "}
                <Link href="/login" className={`font-semibold ${linkAccent}`}>
                  {t.loginHere}
                </Link>
              </p>
            </form>
          )}
        </main>
      </div>
    </>
  );
}
