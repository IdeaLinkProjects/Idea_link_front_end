import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { extractApiErrorMessage } from "@/lib/api/extractApiErrorMessage";
import { useCreateCompanyMutation } from "@/store";

type CreateCompanyForm = {
  name: string;
  industry: string;
  description: string;
  website: string;
  incorporationDate: string;
  registrationNumber: string;
  taxIdentificationNumber: string;
  businessLicenseNumber: string;
  isRegisteredCompany: boolean;
  foundedYear: string;
  headquarters: string;
  companiesize: string;
  stage: string;
};

const initialForm: CreateCompanyForm = {
  name: "",
  industry: "",
  description: "",
  website: "",
  incorporationDate: "",
  registrationNumber: "",
  taxIdentificationNumber: "",
  businessLicenseNumber: "",
  isRegisteredCompany: false,
  foundedYear: "",
  headquarters: "",
  companiesize: "",
  stage: "",
};

export function CreateCompanyProfileView() {
  const router = useRouter();
  const { isDark } = useAppPreferences();
  const [createCompany, { isLoading }] = useCreateCompanyMutation();
  const [form, setForm] = useState<CreateCompanyForm>(initialForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  function updateField<K extends keyof CreateCompanyForm>(key: K, value: CreateCompanyForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setErrorMessage(null);

    if (!form.name.trim() || !form.industry.trim()) {
      setErrorMessage("Company name and industry are required.");
      return;
    }

    const foundedYearRaw = form.foundedYear.trim();
    const foundedYearFromDate = form.incorporationDate ? Number(form.incorporationDate.slice(0, 4)) : NaN;
    const foundedYearParsed = foundedYearRaw ? Number(foundedYearRaw) : foundedYearFromDate;

    if (!Number.isInteger(foundedYearParsed) || foundedYearParsed < 1800 || foundedYearParsed > currentYear + 1) {
      setErrorMessage(`Founded year must be a valid 4-digit year (1800-${currentYear + 1}).`);
      return;
    }

    try {
      await createCompany({
        name: form.name.trim(),
        industry: form.industry.trim(),
        description: form.description.trim(),
        website: form.website.trim(),
        incorporationDate: form.incorporationDate.trim(),
        registrationNumber: form.registrationNumber.trim(),
        taxIdentificationNumber: form.taxIdentificationNumber.trim(),
        businessLicenseNumber: form.businessLicenseNumber.trim(),
        isRegisteredCompany: form.isRegisteredCompany,
        foundedYear: foundedYearParsed,
        headquarters: form.headquarters.trim(),
        companiesize: form.companiesize.trim(),
        stage: form.stage.trim(),
      }).unwrap();

      await router.push("/dashboard/company");
    } catch (err) {
      setErrorMessage(extractApiErrorMessage(err, "Could not create company. Please try again."));
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href="/dashboard/company"
        className={`inline-flex text-sm font-semibold ${isDark ? "text-primary-400 hover:text-primary-300" : "text-primary-700 hover:text-primary-800"}`}
      >
        ← Back to company
      </Link>

      <section className={`rounded-3xl border p-6 sm:p-8 ${isDark ? "border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950/90" : "border-zinc-200 bg-gradient-to-br from-white to-zinc-50"}`}>
        <h1 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>Create company</h1>
        <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Fill company info to create your profile.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label htmlFor="company-name" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Company name</label>
              <input id="company-name" type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Company name" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>
            <div>
              <label htmlFor="company-industry" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Industry</label>
              <input id="company-industry" type="text" value={form.industry} onChange={(e) => updateField("industry", e.target.value)} placeholder="Industry" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>
            <div>
              <label htmlFor="company-website" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Website</label>
              <input id="company-website" type="url" value={form.website} onChange={(e) => updateField("website", e.target.value)} placeholder="Website" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>
            <div>
              <label htmlFor="company-incorporation-date" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Incorporation date</label>
              <input
                id="company-incorporation-date"
                type="date"
                value={form.incorporationDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => {
                    const next = { ...prev, incorporationDate: value };
                    if (!prev.foundedYear.trim() && value) {
                      next.foundedYear = value.slice(0, 4);
                    }
                    return next;
                  });
                }}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="company-registration-number" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Registration number</label>
              <input id="company-registration-number" type="text" value={form.registrationNumber} onChange={(e) => updateField("registrationNumber", e.target.value)} placeholder="Registration number" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>
            <div>
              <label htmlFor="company-tax-id" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Tax identification number</label>
              <input id="company-tax-id" type="text" value={form.taxIdentificationNumber} onChange={(e) => updateField("taxIdentificationNumber", e.target.value)} placeholder="Tax identification number" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>
            <div>
              <label htmlFor="company-license-number" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Business license number</label>
              <input id="company-license-number" type="text" value={form.businessLicenseNumber} onChange={(e) => updateField("businessLicenseNumber", e.target.value)} placeholder="Business license number" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>
            <div>
              <label htmlFor="company-founded-year" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Founded year</label>
              <input
                id="company-founded-year"
                type="number"
                value={form.foundedYear}
                min={1800}
                max={currentYear + 1}
                step={1}
                onChange={(e) => updateField("foundedYear", e.target.value)}
                placeholder="Founded year (e.g. 2021)"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="company-headquarters" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Headquarters</label>
              <input id="company-headquarters" type="text" value={form.headquarters} onChange={(e) => updateField("headquarters", e.target.value)} placeholder="Headquarters" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>
            <div>
              <label htmlFor="company-size" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Company size</label>
              <input id="company-size" type="text" value={form.companiesize} onChange={(e) => updateField("companiesize", e.target.value)} placeholder="Company size" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>
            <div>
              <label htmlFor="company-stage" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Stage</label>
              <input id="company-stage" type="text" value={form.stage} onChange={(e) => updateField("stage", e.target.value)} placeholder="Stage" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>
            <label className={`flex items-center rounded-xl border px-3 py-2.5 text-sm ${isDark ? "border-zinc-700 bg-zinc-950 text-zinc-300" : "border-zinc-300 bg-white text-zinc-700"}`}>
              <input type="checkbox" checked={form.isRegisteredCompany} onChange={(e) => updateField("isRegisteredCompany", e.target.checked)} className="h-4 w-4 accent-primary-600" />
              <span className="ml-2">Registered company</span>
            </label>
            <div className="md:col-span-2">
              <label htmlFor="company-description" className={`mb-1 block text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>Description</label>
              <textarea id="company-description" rows={3} value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Description" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" />
            </div>
          </div>

          {errorMessage ? <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p> : null}

          <div className="flex items-center justify-end gap-2">
            <Link
              href="/dashboard/company"
              className={`rounded-xl border px-4 py-2 text-sm font-semibold ${isDark ? "border-zinc-600 text-zinc-300 hover:bg-zinc-800" : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"}`}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Creating..." : "Create your company"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
