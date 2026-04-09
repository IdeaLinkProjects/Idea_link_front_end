import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FormEvent, useMemo, useState } from "react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { type RegisterRole } from "@/lib/register/constants";
import { saveDemoUserRole } from "@/lib/register/demoRoleStorage";
import { registerRoleFromQuery } from "@/lib/register/routerRole";
import { createEmptyRegisterForm, type RegisterFormState } from "@/lib/register/types";
import { validateRegisterForm } from "@/lib/register/validateRegisterForm";
import { messages } from "@/locales";
import { RegisterForm } from "./RegisterForm";
import { RoleSelector } from "./RoleSelector";
import { SuccessMessage } from "./SuccessMessage";

export function RegisterPage() {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const t = messages[locale].registerPage;

  const urlRole = registerRoleFromQuery(router);

  const [pickedRole, setPickedRole] = useState<RegisterRole | null>(null);
  const [ignoreUrlRole, setIgnoreUrlRole] = useState(false);
  const effectiveRole = ignoreUrlRole ? pickedRole : (pickedRole ?? urlRole);

  const [form, setForm] = useState<RegisterFormState>(() => createEmptyRegisterForm());
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);

  const errors = useMemo(
    () => validateRegisterForm(form, effectiveRole, t),
    [form, effectiveRole, t],
  );

  const handleSelectRole = (role: RegisterRole) => {
    setPickedRole(role);
    setIgnoreUrlRole(true);
  };

  const handleChangeRole = () => {
    setPickedRole(null);
    setIgnoreUrlRole(true);
    setSubmitted(false);
    setForm((prev) => ({ ...prev, licenseFile: null }));
  };

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const nextErrors = validateRegisterForm(form, effectiveRole, t);
    setSubmitted(true);
    if (Object.keys(nextErrors).length > 0) return;
    if (effectiveRole) saveDemoUserRole(effectiveRole);
    setSuccess(true);
  };

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
            <SuccessMessage t={t} isDark={isDark} signInLabel={messages[locale].loginPage.signIn} />
          ) : !effectiveRole ? (
            <RoleSelector t={t} isDark={isDark} onSelectRole={handleSelectRole} />
          ) : (
            <RegisterForm
              t={t}
              isDark={isDark}
              role={effectiveRole}
              form={form}
              setForm={setForm}
              errors={errors}
              submitted={submitted}
              onSubmit={handleSubmit}
              onChangeRole={handleChangeRole}
            />
          )}
        </main>
      </div>
    </>
  );
}

export default RegisterPage;
