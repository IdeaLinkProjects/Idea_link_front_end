import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { messages } from "@/locales";
import {
  useCompleteInvestorProfileMutation,
  useCreateInvestorProfileMutation,
  useGetInvestorProfileQuery,
  useGetUserRolesStatusQuery,
} from "@/store";

export function CompleteInvestorProfileView() {
  const { locale, isDark } = useAppPreferences();
  const p = messages[locale].dashboardProfilePage;
  const { data: rolesStatus, isLoading: rolesStatusLoading } = useGetUserRolesStatusQuery();
  const profileAlreadyComplete = rolesStatus?.investorPrerequisites?.investorProfileComplete === true;

  const [createInvestorProfile, { isLoading: isCreating }] = useCreateInvestorProfileMutation();
  const [completeInvestorProfile, { isLoading: isUpdating }] = useCompleteInvestorProfileMutation();
  const { data: investorProfile } = useGetInvestorProfileQuery(undefined, {
    skip: rolesStatusLoading || !profileAlreadyComplete,
  });

  const [riskTolerance, setRiskTolerance] = useState("CONSERVATIVE");
  const [maxInvestmentLimit, setMaxInvestmentLimit] = useState("100");
  const [investmentExperience, setInvestmentExperience] = useState("BEGINNER");
  const [preferredCategories, setPreferredCategories] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [prefilledFromApi, setPrefilledFromApi] = useState(false);

  useEffect(() => {
    if (!investorProfile || prefilledFromApi) return;

    setRiskTolerance(investorProfile.riskTolerance || "CONSERVATIVE");
    setMaxInvestmentLimit(String(investorProfile.maxInvestmentLimit ?? 100));
    setInvestmentExperience(investorProfile.investmentExperience || "BEGINNER");
    setPreferredCategories(investorProfile.preferredCategories?.join(", ") ?? "");
    setPrefilledFromApi(true);
  }, [investorProfile, prefilledFromApi]);

  const categoryList = useMemo(
    () =>
      preferredCategories
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [preferredCategories],
  );

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const amount = Number(maxInvestmentLimit);
    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage("Max investment limit must be a positive number.");
      return;
    }
    if (!categoryList.length) {
      setErrorMessage("Please add at least one preferred category.");
      return;
    }

    const payload = {
      riskTolerance,
      maxInvestmentLimit: amount,
      investmentExperience,
      preferredCategories: categoryList,
    };

    try {
      const res = profileAlreadyComplete
        ? await completeInvestorProfile(payload).unwrap()
        : await createInvestorProfile(payload).unwrap();

      setSuccessMessage(
        res.message ??
          (profileAlreadyComplete ? "Investor profile updated successfully." : "Investor profile created successfully."),
      );
    } catch (err) {
      setErrorMessage(extractApiErrorMessage(err, "Could not save investor profile. Please try again."));
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-1">
      <Link
        href="/dashboard/profile"
        className={`inline-flex text-sm font-semibold ${isDark ? "text-primary-400 hover:text-primary-300" : "text-primary-700 hover:text-primary-800"}`}
      >
        ← {p.backToProfile}
      </Link>
      <div
        className={`rounded-2xl border p-8 ${isDark ? "border-white/10 bg-zinc-900/50" : "border-zinc-200 bg-white shadow-sm"}`}
      >
        <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{p.completeInvestorPageTitle}</h1>
        <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{p.completeInvestorPageBody}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="maxInvestmentLimit" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
                Max investment limit (ETB)
              </label>
              <input
                id="maxInvestmentLimit"
                type="number"
                min={1}
                value={maxInvestmentLimit}
                onChange={(e) => setMaxInvestmentLimit(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="riskTolerance" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
                Risk tolerance
              </label>
              <select
                id="riskTolerance"
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="CONSERVATIVE">CONSERVATIVE</option>
                <option value="MODERATE">MODERATE</option>
                <option value="AGGRESSIVE">AGGRESSIVE</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="preferredCategories" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
                Preferred categories (comma separated)
              </label>
              <input
                id="preferredCategories"
                type="text"
                value={preferredCategories}
                onChange={(e) => setPreferredCategories(e.target.value)}
                placeholder="string, fintech, agriculture"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="investmentExperience" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
                Investment experience
              </label>
              <select
                id="investmentExperience"
                value={investmentExperience}
                onChange={(e) => setInvestmentExperience(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </div>
          </div>

          {errorMessage ? <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{successMessage}</p> : null}

          <button
            type="submit"
            disabled={isCreating || isUpdating || rolesStatusLoading}
            className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating || isUpdating
              ? p.savingProfile
              : profileAlreadyComplete
                ? p.saveInvestorProfileCta
                : p.submitInvestorProfileCta}
          </button>
        </form>
      </div>
    </div>
  );
}
