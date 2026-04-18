import Head from "next/head";
import Link from "next/link";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { messages } from "@/locales";

export default function ForgotPasswordPage() {
  const { locale } = useAppPreferences();

  const login = messages[locale].loginPage;
  const title = locale === "am" ? "የይለፍ ቃል ዳግም ማስቀጠል" : "Reset password";
  const body =
    locale === "am"
      ? "ይህ ባህሪ በቅርቡ ይገኛል። እባክዎ የድጋፍ ቡድናችንን ያግኙ።"
      : "Password reset is coming soon. Please contact support if you need help.";

  return (
    <>
      <Head>
        <title>{title} | IdealLink</title>
      </Head>
      <div className="min-h-screen bg-zinc-50 px-4 py-16 text-center text-zinc-800">
        <Link href="/" className="text-lg font-bold">
          <span className="text-primary-600">Ideal</span>
          <span className="text-primary-500">Link</span>
        </Link>
        <h1 className="mt-8 text-2xl font-bold">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-zinc-600">{body}</p>
        <Link href="/login" className="mt-8 inline-block font-semibold text-primary-700 hover:underline">
          ← {login.title}
        </Link>
      </div>
    </>
  );
}
