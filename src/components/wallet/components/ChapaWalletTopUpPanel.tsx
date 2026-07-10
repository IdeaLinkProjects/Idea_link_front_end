import { useState } from "react";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { useInitializeChapaPaymentMutation, useLazyVerifyChapaPaymentQuery } from "@/store";
import type { ChapaVerifyResponse } from "@/store";

type ChapaWalletTopUpPanelProps = {
  isDark: boolean;
  balance: number;
  loadingWallet?: boolean;
  requiredAmount?: number;
  onVerified?: (result: ChapaVerifyResponse) => void | Promise<void>;
};

export function ChapaWalletTopUpPanel({
  isDark,
  balance,
  loadingWallet = false,
  requiredAmount = 0,
  onVerified,
}: ChapaWalletTopUpPanelProps) {
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<"ok" | "err">("ok");
  const [pendingTxRef, setPendingTxRef] = useState("");
  const [initializeTopUp, { isLoading: initializing }] = useInitializeChapaPaymentMutation();
  const [verifyPayment, { isFetching: verifying }] = useLazyVerifyChapaPaymentQuery();

  const panelClass = isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50";
  const labelClass = isDark ? "text-zinc-300" : "text-zinc-700";
  const inputClass = isDark
    ? "border-white/20 bg-zinc-900 text-zinc-100"
    : "border-zinc-300 bg-white text-zinc-900";

  const startTopUp = async () => {
    setNotice("");
    const amount = Math.max(1, Math.round(topUpAmount));
    try {
      const res = await initializeTopUp({ amount }).unwrap();
      const txRef = res.txRef?.trim() || "";
      const checkoutUrl = res.checkoutUrl || res.checkout_url || res.paymentUrl || res.payment_url || "";
      if (txRef) setPendingTxRef(txRef);
      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      }
      setNoticeTone("ok");
      setNotice(
        checkoutUrl
          ? "Payment initialized. Complete it in the opened Chapa page, then verify below."
          : "Payment initialized. Verify your transaction reference after completing payment.",
      );
    } catch (err) {
      setNoticeTone("err");
      setNotice(extractApiErrorMessage(err, "Could not initialize payment."));
    }
  };

  const runVerify = async () => {
    setNotice("");
    const txRef = pendingTxRef.trim();
    if (!txRef) {
      setNoticeTone("err");
      setNotice("Enter a valid transaction reference.");
      return;
    }
    try {
      const res = await verifyPayment(txRef).unwrap();
      if (!res.verified) {
        setNoticeTone("err");
        setNotice("Payment is not verified yet. Please try again shortly.");
        return;
      }
      await onVerified?.(res);
      setNoticeTone("ok");
      setNotice("Payment verified. Wallet balance updated successfully.");
    } catch (err) {
      setNoticeTone("err");
      setNotice(extractApiErrorMessage(err, "Could not verify payment."));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className={`rounded-xl border p-4 ${panelClass}`}>
        <h2 className="text-base font-semibold">Wallet</h2>
        <p className={`mt-2 text-sm ${labelClass}`}>
          Current balance: <span className="font-semibold">{balance.toLocaleString()} ETB</span>
        </p>
        {requiredAmount > 0 ? (
          <p className={`mt-2 text-sm ${isDark ? "text-amber-300" : "text-amber-700"}`}>
            Required for pending investment: {requiredAmount.toLocaleString()} ETB
          </p>
        ) : null}
        {loadingWallet ? (
          <p className={`mt-2 text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Refreshing wallet…</p>
        ) : null}
      </section>

      <section className={`rounded-xl border p-4 ${panelClass}`}>
        <h2 className="text-base font-semibold">Top up wallet (Chapa)</h2>
        <label htmlFor="wallet-amount" className={`mt-3 block text-sm ${labelClass}`}>
          Amount (ETB)
        </label>
        <input
          id="wallet-amount"
          type="number"
          min={1}
          step={1}
          value={topUpAmount}
          onChange={(e) => setTopUpAmount(Number(e.target.value) || 0)}
          className={`mt-2 w-full rounded-lg border px-3 py-2 ${inputClass}`}
        />
        <button
          type="button"
          onClick={() => void startTopUp()}
          disabled={initializing}
          className="mt-3 rounded-lg bg-primary-950 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900 disabled:opacity-60"
        >
          {initializing ? "Initializing..." : "Initialize payment"}
        </button>
      </section>

      <section className={`rounded-xl border p-4 lg:col-span-2 ${panelClass}`}>
        <h2 className="text-base font-semibold">Verify Chapa payment</h2>
        <label htmlFor="tx-ref" className={`mt-3 block text-sm ${labelClass}`}>
          Transaction reference (txRef)
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="tx-ref"
            type="text"
            value={pendingTxRef}
            onChange={(e) => setPendingTxRef(e.target.value)}
            className={`min-w-0 flex-1 rounded-lg border px-3 py-2 ${inputClass}`}
          />
          <button
            type="button"
            onClick={() => void runVerify()}
            disabled={verifying}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {verifying ? "Verifying..." : "Verify payment"}
          </button>
        </div>
      </section>

      {notice ? (
        <p className={`text-sm font-medium lg:col-span-2 ${noticeTone === "ok" ? "text-emerald-400" : "text-red-400"}`}>
          {notice}
        </p>
      ) : null}
    </div>
  );
}
