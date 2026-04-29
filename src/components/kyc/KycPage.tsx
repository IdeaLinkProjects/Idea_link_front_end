import Head from "next/head";
import { useRouter } from "next/router";
import { type FormEvent, useCallback, useState } from "react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { readRememberedEmail } from "@/lib/login/rememberEmailStorage";
import { persistKycSkipped, resolveDashboardPath } from "@/lib/login/resolvePostLoginPath";
import { messages } from "@/locales";
import { useUploadKycMutation, useVerifyPhoneOtpMutation } from "@/store";
import { IdealLinkLogo } from "@/components/brand/IdealLinkLogo";
import { RegisterPromoPanel } from "@/components/register/RegisterPromoPanel";

const OTP_REGEX = /^\d{4,8}$/;

export function KycPage() {
  const router = useRouter();
  const { locale } = useAppPreferences();
  const t = messages[locale].kycPage;
  const registerPromo = messages[locale].registerPage;

  const [uploadKyc, { isLoading: isUploading }] = useUploadKycMutation();
  const [verifyPhoneOtp, { isLoading: isVerifyingPhone }] = useVerifyPhoneOtpMutation();

  const [fanNumber, setFanNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);

  const handleKycSubmit = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      setGeneralError(null);
      setSuccessMessage(null);

      const value = fanNumber.trim();
      if (!value) {
        setGeneralError(t.errors.fanNumberRequired);
        return;
      }
      if (!file) {
        setGeneralError(t.errors.fileRequired);
        return;
      }

      const formData = new FormData();
      formData.append("fanNumber", value);
      formData.append("file", file);

      try {
        const res = await uploadKyc(formData).unwrap();
        setSuccessMessage(res.message ?? t.uploadSuccess);
        // Assume SMS OTP is sent by backend after KYC upload succeeds.
        setShowPhoneVerification(true);
        setOtpError(null);
      } catch (err) {
        const message = extractApiErrorMessage(err, t.uploadError);
        setGeneralError(message);
      }
    },
    [fanNumber, file, t, uploadKyc],
  );

  const handleVerifyPhone = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      setOtpError(null);

      const trimmed = otpCode.trim();
      if (!trimmed) {
        setOtpError("Verification code is required.");
        return;
      }
      if (!OTP_REGEX.test(trimmed)) {
        setOtpError("Enter a valid numeric code.");
        return;
      }

      try {
        await verifyPhoneOtp({ otpCode: trimmed }).unwrap();
        void router.push(resolveDashboardPath(readRememberedEmail()));
      } catch (err) {
        const message = extractApiErrorMessage(err, "Phone verification failed. Please try again.");
        setOtpError(message);
      }
    },
    [otpCode, verifyPhoneOtp, router],
  );

  const handleSkipToDashboard = useCallback(() => {
    persistKycSkipped();
    void router.push(resolveDashboardPath(readRememberedEmail()));
  }, [router]);

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
                <IdealLinkLogo className="inline-flex items-center transition hover:opacity-90" width={140} height={42} imageClassName="h-10 w-auto" priority />
              </div>

              <h1 className="mt-2 text-center text-lg font-bold tracking-tight text-zinc-900 sm:text-xl lg:text-left dark:text-white">{t.title}</h1>
              <p className="mt-2 text-center text-sm text-zinc-600 lg:text-left dark:text-zinc-400">{t.subtitle}</p>

              {!showPhoneVerification ? (
                <form
                  onSubmit={handleKycSubmit}
                  className="mt-6 space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80"
                >
            <div>
              <label htmlFor="kyc-fan-number" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {t.fanNumber}
              </label>
              <input
                id="kyc-fan-number"
                type="text"
                value={fanNumber}
                onChange={(e) => setFanNumber(e.target.value)}
                placeholder={t.fanNumberPlaceholder}
                autoComplete="off"
                required
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="kyc-file" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {t.documentFile}
              </label>
              <input
                id="kyc-file"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-1.5 block w-full text-sm text-zinc-600 file:mr-4 file:rounded-md file:border-0 file:bg-primary-950 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-primary-900 dark:text-zinc-400"
              />
            </div>

            {generalError ? (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {generalError}
              </p>
            ) : null}
            {successMessage ? (
              <p className="text-sm text-primary-700 dark:text-primary-400" role="status">
                {successMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isUploading}
              className="flex w-full justify-center rounded-lg bg-primary-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? t.submitting : t.submit}
            </button>

            <button
              type="button"
              onClick={handleSkipToDashboard}
              className="mx-auto block w-auto px-1 py-1 text-xs font-medium text-zinc-500 underline-offset-2 transition hover:text-zinc-700 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {t.skipForNow}
            </button>
                </form>
              ) : null}

              {showPhoneVerification ? (
                <form
                  onSubmit={handleVerifyPhone}
                  className="mt-6 space-y-4 rounded-2xl border border-dashed border-primary-300 bg-primary-50/60 p-4 text-sm text-zinc-800 dark:border-primary-700 dark:bg-primary-900/20 dark:text-zinc-50"
                >
                  <p className="font-medium">Phone verification</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    Enter the verification code sent to your phone to complete your profile.
                  </p>

                  <div>
                    <label htmlFor="phone-otp" className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
                      Verification code
                    </label>
                    <input
                      id="phone-otp"
                      type="text"
                      inputMode="numeric"
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value);
                        setOtpError(null);
                      }}
                      className="mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </div>

                  {otpError ? (
                    <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                      {otpError}
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPhoneVerification(false);
                        setOtpError(null);
                      }}
                      className="inline-flex shrink-0 justify-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      Go back
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifyingPhone}
                      className="inline-flex flex-1 justify-center rounded-lg bg-primary-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isVerifyingPhone ? "Sending…" : "Send code"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipToDashboard}
                      className="inline-flex w-full justify-center px-1 py-0.5 text-xs font-medium text-zinc-500 underline-offset-2 transition hover:text-zinc-700 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200 sm:ml-auto sm:w-auto sm:shrink-0"
                    >
                      {t.skipForNow}
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}