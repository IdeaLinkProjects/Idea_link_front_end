import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FormEvent, useMemo, useState } from "react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { createInitialLoginForm, type LoginFormState } from "@/lib/login/types";
import { persistRememberedEmail } from "@/lib/login/rememberEmailStorage";
import { resolvePostLoginPath } from "@/lib/login/resolvePostLoginPath";
import { validateLoginForm } from "@/lib/login/validateLoginForm";
import { messages } from "@/locales";
import { RegisterPromoPanel } from "@/components/register/RegisterPromoPanel";
import { LoginForm } from "./LoginForm";

export function LoginPage() {
  const router = useRouter();
  const { locale } = useAppPreferences();
  const t = messages[locale].loginPage;
  const registerPromo = messages[locale].registerPage;

  const [form, setForm] = useState<LoginFormState>(() => createInitialLoginForm());
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => {
    if (!submitted) return {};
    return validateLoginForm(form.email, form.password, t);
  }, [submitted, form.email, form.password, t]);

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const nextErrors = validateLoginForm(form.email, form.password, t);
    setSubmitted(true);
    if (Object.keys(nextErrors).length > 0) return;
    persistRememberedEmail(form.email, form.remember);
    void router.push(resolvePostLoginPath(form.email));
  };

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex min-h-dvh flex-col bg-zinc-100 text-zinc-900 max-lg:overflow-y-auto dark:bg-zinc-950 dark:text-zinc-100 lg:h-dvh lg:max-h-dvh lg:overflow-hidden">
        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col lg:max-w-none lg:flex-row xl:max-w-[1400px]">
          <RegisterPromoPanel t={registerPromo} className="order-2 w-full shrink-0 lg:order-1 lg:min-h-0 lg:w-1/2 xl:w-[46%]" />

          <div className="order-1 flex min-h-0 w-full flex-1 flex-col justify-center px-4 py-6 sm:px-6 lg:order-2 lg:w-1/2 lg:px-8 lg:py-5 xl:w-[54%] xl:px-10">
            <div className="mx-auto w-full max-w-[22rem] sm:max-w-md">
              <div className="text-center lg:text-left">
                <Link href="/" className="inline-block text-xl font-extrabold tracking-tight transition hover:opacity-90 sm:text-2xl">
                  <span className="text-emerald-500">Ideal</span>
                  <span className="text-emerald-300">Link</span>
                </Link>
              </div>

              <h1 className="mt-2 text-center text-lg font-bold tracking-tight text-zinc-900 sm:text-xl lg:text-left dark:text-white">
                {t.title}
              </h1>

              <LoginForm t={t} form={form} setForm={setForm} errors={errors} submitted={submitted} onSubmit={handleSubmit} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
