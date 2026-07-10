import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import { useLazyVerifyChapaPaymentQuery } from "@/store";

function firstQueryValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0]?.trim() || "";
  return typeof value === "string" ? value.trim() : "";
}

function readTxRef(query: Record<string, string | string[] | undefined>): string {
  return (
    firstQueryValue(query.trx_ref) ||
    firstQueryValue(query.tx_ref) ||
    firstQueryValue(query.txRef) ||
    firstQueryValue(query.reference) ||
    ""
  );
}

type VerifyState = "idle" | "verifying" | "success" | "failed";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { locale, isDark } = useAppPreferences();
  const { activeWorkspace } = useWorkspace();
  const t = messages[locale].paymentSuccessPage;
  const [verifyPayment] = useLazyVerifyChapaPaymentQuery();

  const [state, setState] = useState<VerifyState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const txRef = useMemo(() => (router.isReady ? readTxRef(router.query) : ""), [router.isReady, router.query]);

  const walletHref = activeWorkspace === "investor" ? "/dashboard/payment" : "/dashboard/wallet";

  const cardClass = isDark
    ? "border-white/15 bg-white/10 shadow-lg shadow-black/20"
    : "border-zinc-200 bg-white shadow-md shadow-zinc-200/60";
  const mutedClass = isDark ? "text-zinc-400" : "text-zinc-600";
  const valueClass = isDark ? "text-zinc-100" : "text-zinc-900";

  useEffect(() => {
    if (!router.isReady) return;

    let cancelled = false;

    const run = async () => {
      if (!txRef) {
        setState("success");
        return;
      }

      setState("verifying");
      setErrorMessage("");
      try {
        const res = await verifyPayment(txRef).unwrap();
        if (cancelled) return;
        if (!res.verified) {
          setState("failed");
          setErrorMessage(t.notVerifiedYet);
          return;
        }
        setAmount(res.amount);
        setPaymentMethod(res.paymentMethod || "");
        setTransactionId(res.transactionId || txRef);
        setState("success");
      } catch (err) {
        if (cancelled) return;
        setState("failed");
        setErrorMessage(extractApiErrorMessage(err, t.verifyFailed));
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, txRef, verifyPayment, t.notVerifiedYet, t.verifyFailed]);

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardLayout>
        <div className="mx-auto w-full max-w-xl space-y-6">
          <div className={`rounded-2xl border p-8 text-center ${cardClass}`}>
            {state === "verifying" ? (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-950/10 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
                  <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
                </div>
                <h1 className={`text-2xl font-extrabold ${valueClass}`}>{t.verifyingTitle}</h1>
                <p className={`mt-2 text-sm ${mutedClass}`}>{t.verifyingBody}</p>
              </>
            ) : null}

            {state === "success" || state === "idle" ? (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <CheckCircle2 className="h-9 w-9" aria-hidden />
                </div>
                <h1 className="text-2xl font-extrabold text-emerald-500">{t.successTitle}</h1>
                <p className={`mt-2 text-sm ${mutedClass}`}>{t.successBody}</p>
              </>
            ) : null}

            {state === "failed" ? (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/15 text-red-500">
                  <XCircle className="h-9 w-9" aria-hidden />
                </div>
                <h1 className="text-2xl font-extrabold text-red-500">{t.failedTitle}</h1>
                <p className={`mt-2 text-sm ${mutedClass}`}>{errorMessage || t.failedBody}</p>
              </>
            ) : null}

            {(txRef || amount != null || paymentMethod || transactionId) && state !== "verifying" ? (
              <dl className={`mt-8 space-y-3 rounded-xl border p-4 text-left text-sm ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50"}`}>
                {amount != null ? (
                  <div className="flex justify-between gap-4">
                    <dt className={mutedClass}>{t.amountLabel}</dt>
                    <dd className={`font-semibold tabular-nums ${valueClass}`}>{amount.toLocaleString()} ETB</dd>
                  </div>
                ) : null}
                {paymentMethod ? (
                  <div className="flex justify-between gap-4">
                    <dt className={mutedClass}>{t.methodLabel}</dt>
                    <dd className={`font-medium ${valueClass}`}>{paymentMethod}</dd>
                  </div>
                ) : null}
                {txRef ? (
                  <div className="flex justify-between gap-4">
                    <dt className={mutedClass}>{t.referenceLabel}</dt>
                    <dd className={`break-all font-mono text-xs ${valueClass}`}>{txRef}</dd>
                  </div>
                ) : null}
                {transactionId && transactionId !== txRef ? (
                  <div className="flex justify-between gap-4">
                    <dt className={mutedClass}>{t.transactionIdLabel}</dt>
                    <dd className={`break-all font-mono text-xs ${valueClass}`}>{transactionId}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={walletHref}
                className="rounded-xl bg-primary-950 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-900"
              >
                {t.backToWallet}
              </Link>
              <Link
                href="/dashboard"
                className={`rounded-xl border px-5 py-3 text-sm font-semibold ${
                  isDark ? "border-white/20 text-zinc-100 hover:bg-white/10" : "border-zinc-300 text-zinc-800 hover:bg-zinc-50"
                }`}
              >
                {t.backToDashboard}
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
